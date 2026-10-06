export type Difficulty = "easy" | "medium" | "hard";
export type MergeChance = "low" | "medium" | "high";
export type Experience = "beginner" | "intermediate" | "advanced";

export interface IssueCardData {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  labels: string[];
  difficulty: Difficulty;
  comments: number;
  updatedAt?: string;
  repo: { fullName: string; stars?: number; language?: string; responsiveness?: number };
  mergeChance: MergeChance;
  score?: number;
  reasons?: string[];
  saved?: boolean;
}

export interface Paged<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Me {
  id: string;
  login: string;
  name?: string;
  avatarUrl?: string;
  savedCount: number;
  profile: {
    languages: { name: string; weight: number }[];
    topics: string[];
    experience: Experience;
    extraLanguages?: string[];
    analyzedAt?: string;
  };
}

export const LANGUAGES = [
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
