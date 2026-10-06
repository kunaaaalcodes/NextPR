"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInPrompt from "@/components/SignInPrompt";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="auth-callback">
        <span className="spinner" aria-hidden="true" />
        <p role="status">Checking your GitHub sign-in...</p>
      </div>
    );
  }

  return <SignInPrompt showIntro={false} animateHeading />;
}
