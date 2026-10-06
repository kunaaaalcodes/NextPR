import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { HttpError, asyncHandler } from "../lib/http";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { Issue } from "../models/Issue";
import { Repo } from "../models/Repo";
import { User } from "../models/User";
import { crawlIssues, isCrawling } from "../services/crawler";
import { ScoringProfile, mergeChance, scoreIssue } from "../services/scoring";

const router = Router();
const FRESH_WINDOW_MS = 14 * 24 * 3600 * 1000;

const listQuery = z.object({
  language: z.string().optional(), // comma separated
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  label: z.string().optional(),
  minResponsiveness: z.coerce.number().min(0).max(100).optional(),
  minStars: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
const matchQuery = listQuery.extend({ minScore: z.coerce.number().min(0).max(100).default(0) });

const toCard = <E extends object>(i: any, repo: any, extra: E) => ({
  id: i._id,
  title: i.title,
  url: i.url,
  snippet: i.bodySnippet,
  labels: i.labels,
  difficulty: i.difficulty,
  comments: i.comments,
  updatedAt: i.ghUpdatedAt,
  repo: {
    fullName: i.repoFullName,
    stars: repo?.stars,
    language: repo?.language ?? i.language,
    responsiveness: repo?.responsiveness?.score,
  },
  ...extra,
});

function baseFilter(q: z.infer<typeof listQuery>) {
  const f: Record<string, unknown> = {
    status: "open",
    crawledAt: { $gte: new Date(Date.now() - FRESH_WINDOW_MS) },
  };
  if (q.language)
    f.language = {
      $in: q.language
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  if (q.difficulty) f.difficulty = q.difficulty;
  if (q.label) {
    const labels = q.label
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
    if (labels.length) {
      f.labels = {
        $in: labels.map(
          (label) => new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
        ),
      };
    }
  }
  if (q.minStars) f.repoStars = { $gte: q.minStars };
  return f;
}

// Public browse (no login)
router.get(
  "/issues",
  asyncHandler(async (req, res) => {
    const q = listQuery.parse(req.query);
    const filter = baseFilter(q);
    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ ghUpdatedAt: -1 })
        .skip((q.page - 1) * q.pageSize)
        .limit(q.pageSize)
        .lean(),
      Issue.countDocuments(filter),
    ]);
    const repos = await Repo.find({ fullName: { $in: issues.map((i) => i.repoFullName) } }).lean();
    const byName = new Map(repos.map((r) => [r.fullName, r]));
    res.json({
      data: issues.map((i) => {
        const repo = byName.get(i.repoFullName);
        return toCard(i, repo, { mergeChance: mergeChance(repo?.responsiveness?.score) });
      }),
      page: q.page,
      pageSize: q.pageSize,
      total,
    });
  })
);

// Personalized feed for the signed-in user
router.get(
  "/issues/matches",
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = matchQuery.parse(req.query);
    const user = await User.findById(req.userId).lean();
    if (!user) throw new HttpError(401, "User not found");

    // Build the scoring profile
    const affinity = new Map<string, number>();
    for (const l of user.profile?.languages ?? [])
      if (l.name) affinity.set(l.name.toLowerCase(), l.weight ?? 0);
    const max = Math.max(0, ...affinity.values());
    for (const extra of user.profile?.extraLanguages ?? [])
      affinity.set(extra.toLowerCase(), max || 1);
    const top = Math.max(0, ...affinity.values()) || 1;
    for (const [k, v] of affinity) affinity.set(k, v / top);

    const profile: ScoringProfile = {
      affinity,
      topics: new Set(user.profile?.topics ?? []),
      experience: (user.profile?.experience as ScoringProfile["experience"]) ?? "beginner",
    };

    // Candidate languages: explicit filter, otherwise user's top languages
    const topLangs = [...affinity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k);
    const filter = baseFilter(q);
    if (!q.language) {
      const rx = topLangs.map(
        (l) => new RegExp(`^${l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      );
      if (rx.length) filter.language = { $in: rx };
    }

    const candidates = await Issue.find(filter).sort({ ghUpdatedAt: -1 }).limit(400).lean();
    const repos = await Repo.find({
      fullName: { $in: [...new Set(candidates.map((c) => c.repoFullName))] },
    }).lean();
    const byName = new Map(repos.map((r) => [r.fullName, r]));
    const saved = new Set((user.savedIssues ?? []).map(String));

    const ranked = candidates
      .map((i) => {
        const repo = byName.get(i.repoFullName);
        if (q.minResponsiveness && (repo?.responsiveness?.score ?? 0) < q.minResponsiveness)
          return null;
        const s = scoreIssue(
          { difficulty: i.difficulty as any, language: i.language, ghUpdatedAt: i.ghUpdatedAt },
          repo as any,
          profile
        );
        if (s.score < q.minScore) return null;
        return toCard(i, repo, {
          score: s.score,
          mergeChance: s.mergeChance,
          reasons: s.reasons,
          saved: saved.has(String(i._id)),
        });
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score);

    const start = (q.page - 1) * q.pageSize;
    res.json({
      data: ranked.slice(start, start + q.pageSize),
      page: q.page,
      pageSize: q.pageSize,
      total: ranked.length,
    });
  })
);

router.get(
  "/issues/:id",
  asyncHandler(async (req, res) => {
    const { id } = z
      .object({ id: z.string().refine(mongoose.isValidObjectId, "Invalid id") })
      .parse(req.params);
    const issue = await Issue.findById(id).lean();
    if (!issue) throw new HttpError(404, "Issue not found");
    const repo = await Repo.findOne({ fullName: issue.repoFullName }).lean();
    res.json(
      toCard(issue, repo, {
        mergeChance: mergeChance(repo?.responsiveness?.score),
        repoDetails: repo,
      })
    );
  })
);

// Admin: trigger a crawl manually. Header: x-admin-key
router.post(
  "/admin/crawl",
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (isCrawling()) throw new HttpError(409, "Crawl already in progress");
    const languages = z
      .object({ languages: z.array(z.string()).optional() })
      .parse(req.body ?? {}).languages;
    crawlIssues(languages)
      .then((r) => console.log("Crawl finished", r))
      .catch((e) => console.error("Crawl failed", e));
    res.status(202).json({ message: "Crawl started" });
  })
);

export default router;
