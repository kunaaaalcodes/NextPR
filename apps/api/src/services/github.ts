import { config } from "../config";
import { HttpError } from "../lib/http";

const API = "https://api.github.com";

export interface GhUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  created_at: string;
  public_repos: number;
}
export interface GhRepo {
  full_name: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  size: number;
}
export interface GhPull {
  created_at: string;
  merged_at: string | null;
}
export interface GhSearchIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  repository_url: string;
  labels: ({ name?: string } | string)[];
  comments: number;
  assignee: unknown | null;
  created_at: string;
  updated_at: string;
}

export class GitHubRateLimitError extends Error {
  constructor(public resetAt?: Date) {
    super("GitHub rate limit reached");
  }
}

export async function gh<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "nextpr-api",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (
    (res.status === 403 || res.status === 429) &&
    res.headers.get("x-ratelimit-remaining") === "0"
  ) {
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    throw new GitHubRateLimitError(reset ? new Date(reset * 1000) : undefined);
  }
  if (res.status === 401)
    throw new HttpError(401, "GitHub token is invalid. Please sign in again.");
  if (!res.ok) throw new HttpError(502, `GitHub API error (${res.status})`);
  return (await res.json()) as T;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.GITHUB_CLIENT_ID,
      client_secret: config.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: config.GITHUB_CALLBACK_URL,
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token)
    throw new HttpError(400, `GitHub login failed: ${data.error ?? "unknown error"}`);
  return data.access_token;
}

export const getAuthedUser = (token: string) => gh<GhUser>("/user", token);
