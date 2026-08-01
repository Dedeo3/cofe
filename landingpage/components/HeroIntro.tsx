"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * One-shot GSAP entrance for the hero content — staggers each direct child
 * in on mount, then never touches the DOM again. No scroll listener, no
 * continuous per-frame work.
 */
export default function HeroIntro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 28,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="hero-content">
      {children}
    </div>
  );
}
