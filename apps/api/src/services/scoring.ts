export type Difficulty = "easy" | "medium" | "hard";
export type Experience = "beginner" | "intermediate" | "advanced";

export interface ScoringProfile {
  /** lowercase language -> affinity 0..1 (top language = 1) */
  affinity: Map<string, number>;
  topics: Set<string>;
  experience: Experience;
}

export interface ScoringIssue {
  difficulty: Difficulty;
  language?: string | null;
  ghUpdatedAt?: Date | null;
}
export interface ScoringRepo {
  topics?: string[];
  responsiveness?: {
    score?: number;
    mergeRate?: number;
    medianMergeHours?: number | null;
    sampleSize?: number;
  };
}

const EASY = [
  "good first issue",
  "good-first-issue",
  "beginner",
  "easy",
  "starter",
  "first-timers-only",
  "first timers only",
];
const HARD = ["hard", "complex", "advanced", "difficult", "expert"];

export function inferDifficulty(labels: string[]): Difficulty {
  const l = labels.map((x) => x.toLowerCase());
  if (l.some((x) => HARD.some((h) => x.includes(h)))) return "hard";
  if (l.some((x) => EASY.some((e) => x.includes(e)))) return "easy";
  return "medium";
}

const FIT: Record<Experience, Record<Difficulty, number>> = {
  beginner: { easy: 10, medium: 5, hard: 0 },
  intermediate: { easy: 7, medium: 10, hard: 4 },
  advanced: { easy: 3, medium: 8, hard: 10 },
};

export function mergeChance(responsiveness = 30): "low" | "medium" | "high" {
  return responsiveness >= 70 ? "high" : responsiveness >= 45 ? "medium" : "low";
}

/** Total 0-100: language 40, responsiveness 30, difficulty fit 10, freshness 10, topics 10. */
export function scoreIssue(issue: ScoringIssue, repo: ScoringRepo | undefined, p: ScoringProfile) {
  const reasons: string[] = [];
  let score = 0;

  const affinity = issue.language ? (p.affinity.get(issue.language.toLowerCase()) ?? 0) : 0;
  score += 40 * affinity;
  if (affinity >= 0.6) reasons.push(`Strong match with your ${issue.language} experience`);
  else if (affinity > 0) reasons.push(`You have some ${issue.language} experience`);

  const resp = repo?.responsiveness;
  const respScore = resp?.score ?? 30;
  score += 0.3 * respScore;
  if (resp && (resp.sampleSize ?? 0) >= 5) {
    const pct = Math.round((resp.mergeRate ?? 0) * 100);
    const when =
      resp.medianMergeHours != null
        ? resp.medianMergeHours < 48
          ? `${Math.max(1, Math.round(resp.medianMergeHours))}h`
          : `${Math.round(resp.medianMergeHours / 24)} days`
        : null;
    if (respScore >= 60)
      reasons.push(
        `Maintainers merge ${pct}% of recent PRs${when ? `, typically within ${when}` : ""}`
      );
  }

  const fit = FIT[p.experience][issue.difficulty];
  score += fit;
  if (fit >= 8)
    reasons.push(
      `${issue.difficulty === "easy" ? "Beginner-friendly" : `${issue.difficulty} difficulty`} issue, a good fit for your level`
    );

  const days = issue.ghUpdatedAt
    ? (Date.now() - new Date(issue.ghUpdatedAt).getTime()) / 86400000
    : 999;
  const fresh = days <= 7 ? 10 : days <= 30 ? 7 : days <= 90 ? 4 : 1;
  score += fresh;
  if (days <= 14) reasons.push("Recently active");

  const shared = (repo?.topics ?? []).filter((t) => p.topics.has(t));
  score += Math.min(10, shared.length * 4);
  if (shared.length)
    reasons.push(`Shares topics with your projects: ${shared.slice(0, 3).join(", ")}`);

  return { score: Math.round(Math.min(100, score)), reasons, mergeChance: mergeChance(respScore) };
}
