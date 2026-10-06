"use client";

import { useState } from "react";

const steps = ["Explore", "Review", "Contribute"] as const;
type Step = (typeof steps)[number];

const issueTitle = "Add keyboard navigation to the command menu";

export default function WorkflowShowcase() {
  const [active, setActive] = useState<Step>("Explore");

  return (
    <div className="showcase-frame">
      <div className="showcase-topbar">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="showcase-breadcrumb">
          nextpr <b>/</b> workspace
        </span>
        <span className="showcase-status">
          <i /> GitHub connected
        </span>
      </div>
      <div className="showcase-body">
        <aside className="showcase-rail" aria-label="Workspace sections">
          <span className="rail-mark">N</span>
          <span className="rail-icon rail-icon-active" title="Matches" aria-label="Matches">
            ⌘
          </span>
          <span className="rail-icon" title="Saved issues" aria-label="Saved issues">
            ♡
          </span>
          <span className="rail-icon" title="Your profile" aria-label="Your profile">
            ◉
          </span>
        </aside>
        <div className="showcase-main">
          <div className="showcase-heading">
            <div>
              <span className="eyebrow">YOUR OPEN SOURCE WORKSPACE</span>
              <h3>
                {active === "Explore"
                  ? "Issues worth your time."
                  : active === "Review"
                    ? "Know what the issue needs."
                    : "Make the next move."}
              </h3>
              <p>
                {active === "Explore"
                  ? "A short list, tuned to the work you want to take on."
                  : active === "Review"
                    ? "Project context, maintainer signals, and scope in one place."
                    : "Open the issue and start a conversation with the project."}
              </p>
            </div>
            <div className="showcase-user">
              <span className="user-monogram">JD</span>
              <span>your profile</span>
            </div>
          </div>

          <div className="showcase-tabs" role="group" aria-label="Explore the NextPR workflow">
            {steps.map((step, index) => (
              <button
                key={step}
                type="button"
                className={active === step ? "showcase-tab is-active" : "showcase-tab"}
                aria-pressed={active === step}
                onClick={() => setActive(step)}
              >
                <span className="tab-number">0{index + 1}</span>
                {step}
              </button>
            ))}
          </div>

          <div className="showcase-content" key={active}>
            {active === "Explore" && <BuildPanel />}
            {active === "Review" && <ReviewPanel />}
            {active === "Contribute" && <ShipPanel />}
          </div>
          <div className="showcase-footer">
            <span>Illustrative workspace preview</span>
            <span>
              Matched to your stack <i className="footer-spark">✳</i>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildPanel() {
  return (
    <div className="preview-list">
      <div className="preview-filter-row">
        <span>Top matches</span>
        <span className="preview-filter">
          TypeScript <b>×</b>
        </span>
        <span className="preview-filter">
          Good first issue <b>×</b>
        </span>
        <span className="sort-label">Sorted by fit&nbsp; ↕</span>
      </div>
      <div className="preview-issue preview-issue-selected">
        <span className="issue-glyph issue-glyph-violet">⌘</span>
        <div className="preview-issue-copy">
          <span className="preview-repo">
            radix-ui <b>/</b> primitives
          </span>
          <strong>{issueTitle}</strong>
          <span className="preview-meta">
            TypeScript <i /> good first issue <i /> updated 2d ago
          </span>
        </div>
        <div className="match-score">
          <strong>94</strong>
          <span>FIT</span>
        </div>
      </div>
      <div className="preview-issue">
        <span className="issue-glyph issue-glyph-blue">◈</span>
        <div className="preview-issue-copy">
          <span className="preview-repo">
            vercel <b>/</b> ai
          </span>
          <strong>Improve streaming response examples</strong>
          <span className="preview-meta">
            TypeScript <i /> documentation <i /> updated 5h ago
          </span>
        </div>
        <div className="match-score score-muted">
          <strong>88</strong>
          <span>FIT</span>
        </div>
      </div>
      <div className="preview-issue preview-issue-last">
        <span className="issue-glyph issue-glyph-orange">◉</span>
        <div className="preview-issue-copy">
          <span className="preview-repo">
            storybookjs <b>/</b> storybook
          </span>
          <strong>Add a keyboard shortcut for search</strong>
          <span className="preview-meta">
            TypeScript <i /> enhancement <i /> updated 1d ago
          </span>
        </div>
        <div className="match-score score-muted">
          <strong>82</strong>
          <span>FIT</span>
        </div>
      </div>
    </div>
  );
}

function ReviewPanel() {
  return (
    <div className="review-layout">
      <div className="review-card">
        <span className="preview-repo">
          radix-ui <b>/</b> primitives <span className="preview-number">#2841</span>
        </span>
        <h4>{issueTitle}</h4>
        <p>
          Improve keyboard navigation in the command menu so users can move between results with the
          arrow keys.
        </p>
        <div className="review-labels">
          <span>good first issue</span>
          <span>accessibility</span>
          <span>TypeScript</span>
        </div>
      </div>
      <div className="fit-panel">
        <div className="fit-panel-head">
          <span>WHY THIS MATCHES</span>
          <span className="fit-score-small">94 fit</span>
        </div>
        <div className="fit-reason">
          <span className="reason-check">✓</span>
          <span>
            <b>Your stack</b>
            <small>TypeScript appears in your public repos</small>
          </span>
        </div>
        <div className="fit-reason">
          <span className="reason-check">✓</span>
          <span>
            <b>Maintainer activity</b>
            <small>Recent issues are getting responses</small>
          </span>
        </div>
        <div className="fit-reason">
          <span className="reason-check">✓</span>
          <span>
            <b>Clear scope</b>
            <small>Labels and discussion point to a focused fix</small>
          </span>
        </div>
      </div>
    </div>
  );
}

function ShipPanel() {
  return (
    <div className="ship-layout">
      <div className="ship-card">
        <div className="ship-card-top">
          <span className="issue-glyph issue-glyph-violet">⌘</span>
          <span className="open-state">
            <i /> OPEN ON GITHUB
          </span>
        </div>
        <span className="preview-repo">
          radix-ui <b>/</b> primitives&nbsp; · &nbsp;#2841
        </span>
        <h4>{issueTitle}</h4>
        <p>
          Your fit is clear. The issue is active. Take a closer look at the discussion and decide if
          it’s the right next step.
        </p>
        <div className="ship-actions">
          <span className="ship-action-primary">
            View issue on GitHub <b>↗</b>
          </span>
          <span className="ship-action-save">♡&nbsp; Save for later</span>
        </div>
      </div>
      <div className="ship-note">
        <span className="note-icon">✳</span>
        <div>
          <b>Pick up where you left off</b>
          <p>Save promising issues and come back when you’re ready to contribute.</p>
        </div>
      </div>
    </div>
  );
}
