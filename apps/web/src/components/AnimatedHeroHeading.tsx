"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const phrases = [
  "fit your skills.",
  "match your stack.",
  "challenge you.",
  "you can actually solve.",
  "need your expertise.",
];

const enterDuration = 0.42;
const holdDuration = 2500;

export default function AnimatedHeroHeading() {
  const prefersReducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;

    const timeout = window.setTimeout(
      () => setIsVisible(false),
      enterDuration * 1000 + holdDuration
    );

    return () => window.clearTimeout(timeout);
  }, [isVisible, phraseIndex, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <h1 id="sign-in-heading">
        Find issues that
        <br />
        <span>fit your skills.</span>
      </h1>
    );
  }

  return (
    <h1 id="sign-in-heading">
      Find issues that
      <br />
      <span className="hero-rotating-line">
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            setPhraseIndex((current) => (current + 1) % phrases.length);
            setIsVisible(true);
          }}
        >
          {isVisible && (
            <motion.span
              key={phrases[phraseIndex]}
              className="hero-rotating-text"
              initial={{ opacity: 0, y: 9 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -9,
                transition: { duration: 0.34, ease: [0.4, 0, 1, 1] },
              }}
              transition={{ duration: enterDuration, ease: [0.22, 1, 0.36, 1] }}
            >
              {phrases[phraseIndex]}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </h1>
  );
}
