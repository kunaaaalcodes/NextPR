"use client";

import { useEffect, useState } from "react";
import IssueCard from "@/components/IssueCard";
import SignInPrompt from "@/components/SignInPrompt";
import LoadingState from "@/components/LoadingState";
import ErrorNotice from "@/components/ErrorNotice";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { IssueCardData } from "@/lib/types";

export default function Saved() {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<IssueCardData[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<{ data: IssueCardData[] }>("/api/saved", { auth: true });
      setIssues(result.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void load();
  }, [user]);

  const remove = async (issue: IssueCardData) => {
    try {
      await api(`/api/saved/${issue.id}`, { method: "DELETE", auth: true });
      setIssues((prev) => prev?.filter((item) => item.id !== issue.id) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (authLoading)
    return (
      <div className="route-page site-container">
        <div className="loading-inline" role="status">
          Loading your workspace…
        </div>
      </div>
    );
  if (!user)
    return (
      <div className="route-page site-container">
        <SignInPrompt message="Sign in with GitHub to see your saved issues." />
      </div>
    );

  return (
    <div className="route-page site-container">
      <div className="route-heading">
        <div>
          <span className="section-kicker">YOUR SHORTLIST</span>
          <h1>
            Saved issues<span className="heading-period">.</span>
          </h1>
          <p>A thoughtful list of work to come back to.</p>
        </div>
        {issues && <span className="result-count">{issues.length} saved</span>}
      </div>
      {error && <ErrorNotice message={error} onRetry={() => void load()} />}
      {loading && <LoadingState label="Loading your saved issues" />}
      {!loading && !error && issues?.length === 0 && (
        <div className="empty-state">
          <span className="empty-symbol" aria-hidden="true">
            ♡
          </span>
          <h2>Your shortlist starts here</h2>
          <p>
            Save interesting issues from your matches or browse page. They’ll be waiting here when
            you’re ready.
          </p>
          <a className="button button-primary" href="/browse">
            Browse issues <span aria-hidden="true">→</span>
          </a>
        </div>
      )}
      <div className="issue-list">
        {issues?.map((issue) => (
          <IssueCard key={issue.id} issue={{ ...issue, saved: true }} onToggleSave={remove} />
        ))}
      </div>
    </div>
  );
}
