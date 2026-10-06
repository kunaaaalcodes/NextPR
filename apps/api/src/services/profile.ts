import { GhRepo, GhUser, gh } from "./github";
import { UserDoc } from "../models/User";

export type Experience = "beginner" | "intermediate" | "advanced";

export interface Analysis {
  languages: { name: string; weight: number }[];
  topics: string[];
  experience: Experience;
}

export async function analyzeProfile(user: GhUser, token: string): Promise<Analysis> {
  const repos = await gh<GhRepo[]>(
    `/users/${user.login}/repos?per_page=100&sort=pushed&type=owner`,
    token
  );

  const langWeights = new Map<string, number>();
  const topicCounts = new Map<string, number>();
  const now = Date.now();

  for (const r of repos) {
    if (!r.language || r.archived) continue;
    const ageYears = (now - new Date(r.pushed_at).getTime()) / (365 * 24 * 3600 * 1000);
    const recency = ageYears <= 1 ? 1 : ageYears <= 2 ? 0.6 : 0.3;
    const forkFactor = r.fork ? 0.25 : 1;
    const sizeFactor = 1 + Math.log10(r.size + 1);
    langWeights.set(
      r.language,
      (langWeights.get(r.language) ?? 0) + sizeFactor * recency * forkFactor
    );
    for (const t of r.topics ?? []) topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
  }

  const total = [...langWeights.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...langWeights.entries()]
    .map(([name, w]) => ({ name, weight: Number((w / total).toFixed(4)) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);

  const topics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([t]) => t);

  const accountYears = (now - new Date(user.created_at).getTime()) / (365 * 24 * 3600 * 1000);
  const level = accountYears + user.public_repos / 20;
  const experience: Experience = level < 1.5 ? "beginner" : level < 4 ? "intermediate" : "advanced";

  return { languages, topics, experience };
}

export function applyAnalysis(user: UserDoc, a: Analysis) {
  user.set("profile.languages", a.languages);
  user.set("profile.topics", a.topics);
  if (!user.get("profile.experienceLocked")) user.set("profile.experience", a.experience);
  user.set("profile.analyzedAt", new Date());
}
