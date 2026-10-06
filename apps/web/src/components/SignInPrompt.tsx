import Link from "next/link";
import { SIGN_IN_URL } from "@/lib/api";
import AnimatedHeroHeading from "@/components/AnimatedHeroHeading";

export default function SignInPrompt({
  message = "Sign in with GitHub to see issues matched to your skills.",
  showIntro = true,
  animateHeading = false,
}) {
  return (
    <section className="sign-in-hero" aria-labelledby="sign-in-heading">
      <div className="sign-in-prompt">
        {showIntro && <span className="section-kicker">YOUR NEXT CONTRIBUTION STARTS HERE</span>}
        {animateHeading ? (
          <AnimatedHeroHeading />
        ) : (
          <h1 id="sign-in-heading">
            Find issues that
            <br />
            <span>fit your skills.</span>
          </h1>
        )}
        {showIntro && <p>{message}</p>}
        <a className="button button-primary button-large" href={SIGN_IN_URL}>
          <svg
            className="github-button-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          <span className="github-button-label">Continue with GitHub</span>
        </a>
        <span className="prompt-note">Secure sign-in with your GitHub account.</span>
        <Link className="text-link" href="/browse">
          Browse issues without signing in <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
