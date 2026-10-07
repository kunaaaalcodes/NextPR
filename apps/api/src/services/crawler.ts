import { config } from "../config";
import { sleep } from "../lib/http";
import { Issue } from "../models/Issue";
import { Repo } from "../models/Repo";
import { GhPull, GhRepo, GhSearchIssue, GitHubRateLimitError, gh } from "./github";
import { inferDifficulty } from "./scoring";

export const DEFAULT_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",
];

const STALE_AFTER_DAYS = 120;
const MAX_COMMENTS = 50;
const REPO_REFRESH_MS = 24 * 3600 * 1000;
const PER_PAGE = 100;
const SEARCH_LABEL_GROUPS = [
  ["good first issue", "good-first-issue", "first-timers-only", "beginner"],
  ["bounty", "bug bounty", "bounty issue"],
  ["gsoc", "gsoc issue", "google summer of code"],
  [
    "help wanted",
    "bug",
    "enhancement",
    "feature request",
    "documentation",
    "docs",
    "accessibility",
    "a11y",
    "performance",
    "security",
  ],
  [],
];
let running = false;

const median = (nums: number[]) => {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function computeResponsiveness(fullName: string) {
  const pulls = await gh<GhPull[]>(
    `/repos/${fullName}/pulls?state=closed&per_page=30&sort=updated&direction=desc`,
    config.GITHUB_TOKEN
  );
  const merged = pulls.filter((p) => p.merged_at);
  if (pulls.length < 5)
    return { score: 30, mergeRate: 0, medianMergeHours: null, sampleSize: pulls.length };

  const mergeRate = merged.length / pulls.length;
  const hours = merged.map(
    (p) => (new Date(p.merged_at!).getTime() - new Date(p.created_at).getTime()) / 3600000
  );
  const medianHours = median(hours);
  const speed = medianHours == null ? 0 : Math.max(0, 1 - medianHours / (24 * 14)); // 14+ days => 0
  return {
    score: Math.round(mergeRate * 60 + speed * 40),
    mergeRate: Number(mergeRate.toFixed(3)),
    medianMergeHours: medianHours == null ? null : Number(medianHours.toFixed(1)),
    sampleSize: pulls.length,
  };
}

async function ensureRepo(fullName: string) {
  const existing = await Repo.findOne({ fullName });
  if (existing && Date.now() - existing.fetchedAt.getTime() < REPO_REFRESH_MS) return existing;

  const r = await gh<GhRepo>(`/repos/${fullName}`, config.GITHUB_TOKEN);
  const responsiveness = await computeResponsiveness(fullName);
  return Repo.findOneAndUpdate(
    { fullName },
    {
      fullName,
      stars: r.stargazers_count,
      language: r.language,
      topics: r.topics ?? [],
      archived: r.archived,
      pushedAt: new Date(r.pushed_at),
      responsiveness,
      fetchedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

export interface CrawlResult {
  languages: number;
  upserted: number;
  skipped: number;
  rateLimited: boolean;
}

export function isCrawling() {
  return running;
}

export async function crawlIssues(languages?: string[]): Promise<CrawlResult> {
  if (running) throw new Error("Crawl already in progress");
  running = true;
  const langs =
    languages ??
    (config.CRAWL_LANGUAGES
      ? config.CRAWL_LANGUAGES.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : DEFAULT_LANGUAGES);
  const result: CrawlResult = { languages: 0, upserted: 0, skipped: 0, rateLimited: false };
  const seenIssues = new Set<number>();

  try {
    for (const lang of langs) {
      let searchedLanguage = false;
      for (const labelGroup of SEARCH_LABEL_GROUPS) {
        const hasLabels = labelGroup.length > 0;
        const labelQuery = hasLabels
          ? `label:${labelGroup.map((label) => `"${label}"`).join(",")} `
          : "";
        const q = `${labelQuery}state:open is:issue no:assignee language:"${lang}"`;
        let items: GhSearchIssue[];
        try {
          const data = await gh<{ items: GhSearchIssue[] }>(
            `/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=${PER_PAGE}`,
            config.GITHUB_TOKEN
          );
          items = data.items;
          searchedLanguage = true;
        } catch (e) {
          if (e instanceof GitHubRateLimitError) {
            result.rateLimited = true;
            break;
          }
          const err = e as Error & { cause?: Error };
          console.error(
            `Search failed for ${lang}${hasLabels ? ` labels ${labelGroup.join(", ")}` : " (no label filter)"}:`,
            err.message,
            err.cause ? ` (cause: ${err.cause.message})` : ""
          );
          await sleep(2000);
          continue;
        }

        const requestedLabels = hasLabels
          ? new Set(labelGroup.map((label) => label.toLowerCase()))
          : null;
        for (const item of items) {
          const labels = item.labels
            .map((l) => (typeof l === "string" ? l : (l.name ?? "")))
            .filter(Boolean);
          if (
            requestedLabels &&
            !labels.some((label) => requestedLabels.has(label.toLowerCase()))
          )
            continue;
          if (seenIssues.has(item.id)) continue;
          seenIssues.add(item.id);

          try {
            const fullName = item.repository_url.replace("https://api.github.com/repos/", "");
            const repo = await ensureRepo(fullName);
            if (!repo || repo.archived) {
              result.skipped++;
              continue;
            }

            const ageDays = (Date.now() - new Date(item.updated_at).getTime()) / 86400000;
            const stale =
              ageDays > STALE_AFTER_DAYS || item.comments > MAX_COMMENTS || item.assignee != null;

            await Issue.findOneAndUpdate(
              { githubId: item.id },
              {
                githubId: item.id,
                repoFullName: fullName,
                number: item.number,
                title: item.title,
                bodySnippet: (item.body ?? "").slice(0, 400),
                url: item.html_url,
                labels,
                language: repo.language ?? lang,
                comments: item.comments,
                assigned: item.assignee != null,
                difficulty: inferDifficulty(labels),
                status: stale ? "stale" : "open",
                ghCreatedAt: new Date(item.created_at),
                ghUpdatedAt: new Date(item.updated_at),
                crawledAt: new Date(),
                repoStars: repo.stars,
              },
              { upsert: true }
            );
            result.upserted++;
          } catch (e) {
            if (e instanceof GitHubRateLimitError) {
              result.rateLimited = true;
              break;
            }
            result.skipped++;
          }
        }
        if (result.rateLimited) break;
        await sleep(2500); // stay under the 30 req/min search limit
      }
      if (searchedLanguage) result.languages++;
      if (result.rateLimited) break;
    }
    return result;
  } finally {
    running = false;
  }
}
