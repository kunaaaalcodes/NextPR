"use client";

import { useCallback, useEffect, useState } from "react";
import Filters, { EMPTY_FILTERS, type FilterState } from "@/components/Filters";
import IssueCard from "@/components/IssueCard";
import Pager from "@/components/Pager";
import LoadingState from "@/components/LoadingState";
import ErrorNotice from "@/components/ErrorNotice";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { IssueCardData, Paged } from "@/lib/types";

export default function Browse() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paged<IssueCardData> | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setSavedIds(new Set());
    api<{ data: { id: string }[] }>("/api/saved", { auth: true })
      .then((r) => setSavedIds(new Set(r.data.map((i) => i.id))))
      .catch(() => {});
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(
        await api<Paged<IssueCardData>>(
          `/api/issues${qs({ ...filters, minResponsiveness: filters.minResponsiveness || undefined, minStars: filters.minStars || undefined, page, pageSize: 15 })}`
        )
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleSave = async (issue: IssueCardData) => {
    const isSaved = savedIds.has(issue.id);
    try {
      await api(`/api/saved/${issue.id}`, { method: isSaved ? "DELETE" : "PUT", auth: true });
      setSavedIds((prev) => {
        const next = new Set(prev);
        isSaved ? next.delete(issue.id) : next.add(issue.id);
        return next;
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="route-page site-container">
      <div className="route-heading">
        <div>
          <span className="section-kicker">OPEN SOURCE, WITHOUT THE GUESSWORK</span>
          <h1>Browse issues</h1>
          <p>Find open-source work that fits your skills, interests, and time.</p>
        </div>
        {result && (
          <span className="result-count">
            <i /> {result.total.toLocaleString()} open issues
          </span>
        )}
      </div>
      <div className="browse-toolbar">
        <Filters
          value={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />
      </div>
      {error && <ErrorNotice message={error} onRetry={() => void load()} />}
      {loading && !result && <LoadingState label="Loading open issues" />}
      {loading && result && (
        <div className="update-indicator" role="status">
          <span className="spinner" /> Updating results…
        </div>
      )}
      {!loading && !error && result?.data.length === 0 && (
        <div className="empty-state">
          <span className="empty-symbol" aria-hidden="true">
            ⌕
          </span>
          <h2>No issues match these filters</h2>
          <p>Try broadening your search, or come back as projects publish new work.</p>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Clear filters <span aria-hidden="true">↻</span>
          </button>
        </div>
      )}
      <div className="issue-list">
        {result?.data.map((i) => (
          <IssueCard
            key={i.id}
            issue={{ ...i, saved: savedIds.has(i.id) }}
            onToggleSave={user ? toggleSave : undefined}
          />
        ))}
      </div>
      {result && (
        <Pager page={page} pageSize={result.pageSize} total={result.total} onPage={setPage} />
      )}
    </div>
  );
}
