"use client";

import { useEffect, useState } from "react";

type NavItem = { id: string; label: string };

const NAV: NavItem[] = [
  { id: "hero", label: "Overview" },
  { id: "steps", label: "Flow" },
  { id: "preview", label: "Product" },
];

export default function SiteHeader({
  launchAppUrl,
  contractHref,
}: {
  launchAppUrl: string;
  contractHref: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("hero");

  // Solid-ish background once the user has scrolled past the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav link for whichever section is nearest the middle of
  // the viewport. rootMargin trims 40% off the top and 50% off the bottom
  // so a section only counts when it's actually in the reading zone.
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => !!el
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`site-header${scrolled ? " is-scrolled" : ""}`}
      aria-label="Primary navigation"
    >
      <a className="site-logo" href="#hero">
        Confidential Safe Payroll
      </a>
      <nav className="site-nav" aria-label="Main menu">
        {NAV.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={active === n.id ? "is-active" : undefined}
          >
            {n.label}
          </a>
        ))}
        <a href={contractHref} target="_blank" rel="noopener noreferrer">
          Contract
        </a>
      </nav>
      <a
        className="language-switcher"
        href={launchAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Launch app"
      >
        <span>Launch app</span>
        <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
