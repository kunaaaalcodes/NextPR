"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function MagneticLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches
    )
      return;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * 0.07;
      const y = (event.clientY - (rect.top + rect.height / 2)) * 0.1;
      element.style.setProperty("--magnet-x", `${Math.max(-5, Math.min(5, x))}px`);
      element.style.setProperty("--magnet-y", `${Math.max(-5, Math.min(5, y))}px`);
    };
    const reset = () => {
      element.style.setProperty("--magnet-x", "0px");
      element.style.setProperty("--magnet-y", "0px");
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", reset);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <a ref={ref} href={href} className={className}>
      {children}
    </a>
  );
}
