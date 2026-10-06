"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Filters, { EMPTY_FILTERS, type FilterState } from "@/components/Filters";
import IssueCard from "@/components/IssueCard";
import Pager from "@/components/Pager";
import SignInPrompt from "@/components/SignInPrompt";
import LoadingState from "@/components/LoadingState";
import ErrorNotice from "@/components/ErrorNotice";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Experience, IssueCardData, Me, Paged } from "@/lib/types";

const LEVELS: Experience[] = ["beginner", "intermediate", "advanced"];

export default function Dashboard() {
  const { user, loading: authLoading, setUser, logout } = useAuth();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paged<IssueCardData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(
        await api<Paged<IssueCardData>>(
          `/api/issues/matches${qs({ ...filters, minResponsiveness: filters.minResponsiveness || undefined, minStars: filters.minStars || undefined, page, pageSize: 15 })}`,
          { auth: true }
        )
      );
    } catch (e) {
      const err = e as { status?: number; message: string };
      if (err.status === 401) logout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, logout]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const toggleSave = async (issue: IssueCardData) => {
    try {
      await api(`/api/saved/${issue.id}`, { method: issue.saved ? "DELETE" : "PUT", auth: true });
      setResult(
        (r) =>
          r && {
            ...r,
            data: r.data.map((i) => (i.id === issue.id ? { ...i, saved: !i.saved } : i)),
          }
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const setExperience = async (experience: Experience) => {
    setBusy(true);
    setError("");
    try {
      setUser(
        await api<Me>("/api/me/preferences", { method: "PATCH", body: { experience }, auth: true })
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const refreshProfile = async () => {
    setBusy(true);
    setError("");
    try {
      setUser(await api<Me>("/api/me/refresh-profile", { method: "POST", auth: true }));
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
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
        <SignInPrompt />
      </div>
    );

  return (
    <div className="route-page site-container dashboard-page">
      <div className="route-heading dashboard-heading">
        <div>
          <span className="section-kicker">YOUR NEXT CONTRIBUTION</span>
          <h1>
            Matches for you<span className="heading-period">.</span>
          </h1>
          <p>Ranked against your skills and experience.</p>
        </div>
        <span className="personalized-badge">
          <span className="live-dot" /> PERSONALIZED
        </span>
      </div>
      <div className="dash">
        <aside className="profile-panel">
          <div className="profile-head">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={52}
                height={52}
                className="profile-avatar"
              />
            ) : (
              <span className="profile-avatar profile-avatar-fallback">
                {user.login.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <strong>{user.name ?? user.login}</strong>
              <div className="muted small">@{user.login}</div>
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">
              <h2>Your languages</h2>
              <span>{user.profile.languages.length} detected</span>
            </div>
            <div className="bars">
              {user.profile.languages.slice(0, 5).map((l) => (
                <div key={l.name} className="bar-row">
                  <span>{l.name}</span>
                  <div className="bar">
                    <i style={{ width: `${Math.max(6, Math.round(l.weight * 100))}%` }} />
                  </div>
                  <small>{Math.round(l.weight * 100)}%</small>
                </div>
              ))}
              {user.profile.languages.length === 0 && (
                <p className="muted small">No public repository languages found yet.</p>
              )}
            </div>
          </div>
          <div className="profile-section">
            <div className="profile-section-title">
              <h2>Experience level</h2>
            </div>
            <div className="experience-control" role="group" aria-label="Choose experience level">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  disabled={busy}
                  className={user.profile.experience === level ? "is-selected" : ""}
                  aria-pressed={user.profile.experience === level}
                  onClick={() => void setExperience(level)}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="profile-hint">We’ll tune your matches to the work you want to take on.</p>
          </div>
          <button
            className="button button-quiet profile-refresh"
            type="button"
            disabled={busy}
            onClick={() => void refreshProfile()}
          >
            {busy ? (
              <>
                <span className="spinner" /> Updating…
              </>
            ) : (
              <>
                Re-analyze GitHub <span aria-hidden="true">↻</span>
              </>
            )}
          </button>
        </aside>
        <section className="matches-column" aria-label="Recommended issues">
          <div className="matches-toolbar">
            <div>
              <h2>Recommended issues</h2>
              <p>Open work that fits your profile.</p>
            </div>
            {result && (
              <span className="result-count">
                <i /> {result.total.toLocaleString()} matches
              </span>
            )}
          </div>
          <Filters
            value={filters}
            onChange={(f) => {
              setFilters(f);
              setPage(1);
            }}
            languageLabel="All my languages"
          />
          {error && <ErrorNotice message={error} onRetry={() => void load()} />}
          {loading && !result && <LoadingState label="Finding your matches" />}
          {loading && result && (
            <div className="update-indicator" role="status">
              <span className="spinner" /> Updating matches…
            </div>
          )}
          {!loading && !error && result?.data.length === 0 && (
            <div className="empty-state">
              <span className="empty-symbol" aria-hidden="true">
                ⌕
              </span>
              <h2>No matches yet</h2>
              <p>
                Try changing your filters or refresh your GitHub profile to update your skill
                signals.
              </p>
              <button
                className="button button-quiet"
                onClick={() => void refreshProfile()}
                disabled={busy}
              >
                Refresh my profile <span aria-hidden="true">↻</span>
              </button>
            </div>
          )}
          <div className="issue-list">
            {result?.data.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onToggleSave={toggleSave} />
            ))}
          </div>
          {result && (
            <Pager page={page} pageSize={result.pageSize} total={result.total} onPage={setPage} />
          )}
        </section>
      </div>
    </div>
  );
}
