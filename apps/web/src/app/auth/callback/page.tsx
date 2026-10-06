"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("No sign-in token came back from GitHub. Try starting again.");
      return;
    }
    login(token)
      .then(() => router.replace("/dashboard"))
      .catch((e: Error) => setError(e.message || "We couldn’t complete sign in."));
  }, [login, router]);

  return (
    <div className="auth-callback">
      {error ? (
        <>
          <span className="empty-symbol" aria-hidden="true">
            !
          </span>
          <h1>Sign in didn’t finish.</h1>
          <p>{error}</p>
          <Link className="button button-primary" href="/">
            Back to NextPR <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <>
          <span className="spinner" aria-hidden="true" />
          <p role="status">Connecting your GitHub profile…</p>
        </>
      )}
    </div>
  );
}
