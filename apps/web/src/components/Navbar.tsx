"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SIGN_IN_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function Logo() {
  return (
    <Link href="/" className="brand" aria-label="NextPR home">
      <Image
        src="/nextpr-ink-brush.png"
        alt=""
        width={150}
        height={60}
        className="brand-wordmark"
        priority
      />
    </Link>
  );
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.replace("/");
  };

  return (
    <header
      className={`site-nav${scrolled ? " is-scrolled" : ""}${pathname === "/" ? " is-home" : ""}`}
    >
      <div className="nav-inner site-container">
        <Logo />
        <nav
          id="navigation-links"
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          aria-label="Main navigation"
        >
          {pathname !== "/" && (
            <Link
              href="/browse"
              className={pathname === "/browse" ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Browse issues
            </Link>
          )}
          <Link
            href="/docs"
            className={pathname === "/docs" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Docs
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={pathname === "/dashboard" ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              My matches
            </Link>
          )}
          {user && (
            <Link
              href="/saved"
              className={pathname === "/saved" ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Saved
            </Link>
          )}
          <div className={`mobile-nav-actions${pathname === "/" ? " is-home" : ""}`}>
            {user ? (
              <button className="mobile-signout" type="button" onClick={handleLogout}>
                Sign out
              </button>
            ) : (
              <a className="mobile-cta" href={SIGN_IN_URL}>
                Find issues <span>→</span>
              </a>
            )}
          </div>
        </nav>
        <div className="nav-actions">
          {loading ? (
            <span className="nav-loading" aria-label="Checking sign in status" />
          ) : user ? (
            <div className="nav-user">
              {user.avatarUrl && (
                <Image src={user.avatarUrl} alt="" width={30} height={30} className="nav-avatar" />
              )}
              <Link className="nav-login" href="/dashboard">
                {user.login}
              </Link>
              <button className="nav-logout" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <a className="nav-login" href={SIGN_IN_URL}>
                Log in
              </a>
              <a className="button button-small button-primary nav-cta" href={SIGN_IN_URL}>
                Find issues <span>→</span>
              </a>
            </>
          )}
        </div>
        <button
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="navigation-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
