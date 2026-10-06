import type { Metadata } from "next";
import Link from "next/link";
import { SIGN_IN_URL } from "@/lib/api";

export const metadata: Metadata = {
  title: "Docs",
  description: "How to find, review, and save open-source issues with NextPR.",
};

const steps = [
  {
    n: "01",
    title: "Connect GitHub",
    text: "Sign in securely with GitHub. NextPR reads public repository language signals to build your starting profile.",
  },
  {
    n: "02",
    title: "Set your contribution preferences",
    text: "Choose your experience level and filter by issue labels, language, difficulty, maintainer activity, or repository size.",
  },
  {
    n: "03",
    title: "Review the issue",
    text: "Check the match reasons, scope, and project signals before opening the original issue on GitHub.",
  },
  {
    n: "04",
    title: "Take it to the project",
    text: "Save promising issues, read the contribution guidelines, and decide where you can help.",
  },
];

export default function Docs() {
  return (
    <div className="route-page site-container docs-page">
      <div className="route-heading">
        <div>
          <span className="section-kicker">THE NEXTPR FIELD GUIDE</span>
          <h1>
            Start with the right issue<span className="heading-period">.</span>
          </h1>
          <p>
            A quick guide to finding, evaluating, and saving your next open-source contribution.
          </p>
        </div>
      </div>
      <div className="docs-layout">
        <aside className="docs-aside">
          <span>IN THIS GUIDE</span>
          <a href="#workflow">How it works</a>
          <a href="#matching">About your matches</a>
          <a href="#privacy">Your GitHub profile</a>
        </aside>
        <div className="docs-content">
          <section id="workflow">
            <span className="section-kicker">FOUR QUICK STEPS</span>
            <h2>From GitHub to a good first move.</h2>
            <div className="docs-steps">
              {steps.map((step) => (
                <article key={step.n} className="docs-step">
                  <span>{step.n}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section id="matching">
            <span className="section-kicker">MATCHING, EXPLAINED</span>
            <h2>Useful context, up front.</h2>
            <p>
              NextPR ranks open issues using signals including language fit, maintainer
              responsiveness, difficulty, and freshness. Match reasons give you a starting point;
              always review the full issue and project guidelines on GitHub.
            </p>
            <div className="docs-callout">
              <span>↗</span>
              <p>
                NextPR helps you discover work. Project maintainers decide what gets accepted and
                merged.
              </p>
            </div>
          </section>
          <section id="privacy">
            <span className="section-kicker">YOUR PROFILE</span>
            <h2>Grounded in public GitHub signals.</h2>
            <p>
              Your language profile is based on public repositories. You can change your experience
              level from the dashboard or refresh your profile as your work changes.
            </p>
            <p>
              Signing in lets you use personalized matches and save issues to your account. Browse
              remains available without signing in.
            </p>
          </section>
          <div className="docs-cta">
            <div>
              <h2>Ready to find your next contribution?</h2>
              <p>Start with open-source work that fits your interests and experience.</p>
            </div>
            <a href={SIGN_IN_URL} className="button button-primary">
              Find your next issue <span aria-hidden="true">→</span>
            </a>
            <Link href="/browse" className="text-link">
              Browse first <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
