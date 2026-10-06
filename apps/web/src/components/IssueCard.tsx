import type { IssueCardData } from "@/lib/types";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} mo ago`;
}

interface Props {
  issue: IssueCardData;
  onToggleSave?: (issue: IssueCardData) => void;
}

export default function IssueCard({ issue, onToggleSave }: Props) {
  const { repo } = issue;
  return (
    <article className="issue-card">
      <div className="issue-card-main">
        <div className="issue-head">
          <span className="repo-name">{repo.fullName}</span>
          {repo.language && <span className="issue-chip language-chip">{repo.language}</span>}
          {repo.stars !== undefined && (
            <span className="repo-stars">
              <span aria-hidden="true">★</span> {repo.stars.toLocaleString()}
            </span>
          )}
        </div>
        <a className="issue-title" href={issue.url} target="_blank" rel="noreferrer">
          {issue.title}
          <span className="external-arrow" aria-label="opens in a new tab">
            ↗
          </span>
        </a>
        {issue.snippet && <p className="issue-snippet">{issue.snippet}</p>}
        <div className="issue-chips">
          <span className={`issue-chip difficulty-chip diff-${issue.difficulty}`}>
            {issue.difficulty} difficulty
          </span>
          <span className={`issue-chip merge-chip merge-${issue.mergeChance}`}>
            {issue.mergeChance} merge signal
          </span>
          <span className="issue-meta">
            {issue.comments} comments
            {timeAgo(issue.updatedAt) ? (
              <>
                {" "}
                <i /> updated {timeAgo(issue.updatedAt)}
              </>
            ) : null}
          </span>
        </div>
        {issue.labels.length > 0 && (
          <div className="issue-labels">
            {issue.labels.slice(0, 3).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        )}
        {issue.reasons && issue.reasons.length > 0 && (
          <ul className="issue-reasons">
            {issue.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="issue-card-side">
        {issue.score !== undefined && (
          <div className="issue-score" aria-label={`Match score ${issue.score}`}>
            <strong>{issue.score}</strong>
            <span>match</span>
          </div>
        )}
        {onToggleSave && (
          <button
            className={`save-button${issue.saved ? " is-saved" : ""}`}
            type="button"
            aria-pressed={!!issue.saved}
            aria-label={
              issue.saved ? `Remove ${issue.title} from saved issues` : `Save ${issue.title}`
            }
            onClick={() => onToggleSave(issue)}
          >
            {issue.saved ? (
              <>
                <span aria-hidden="true">✓</span> Saved
              </>
            ) : (
              <>
                <span aria-hidden="true">＋</span> Save
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
