"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";

// TODO: swap when the real app URL is ready.
const LAUNCH_APP_URL = "#";

const NAV_LINKS = [
  { label: "How it works", href: "#" },
  { label: "Contracts", href: "#" },
  { label: "Docs", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Contact", href: "#" },
];

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_234424_b1332b69-2e69-4302-8dbc-40f86846afbd.mp4";

function LogoDots() {
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"
        />
      ))}
    </div>
  );
}

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scaleY, setScaleY] = useState(1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Dynamic vertical scale for the huge wordmark + oval — measured against
  // the screen container so the text fills the "laptop" rather than the
  // whole viewport.
  useEffect(() => {
    const compute = () => {
      const el = bgTextRef.current;
      const screen = screenRef.current;
      if (!el || !screen) return;
      const h = el.offsetHeight;
      if (h > 0) setScaleY(screen.offsetHeight / h);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMenuOpen]);

  const enter = (delay: number) => ({
    transitionProperty: "opacity, transform",
    transitionDuration: "900ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
    opacity: entered ? 1 : 0,
    transform: entered ? "translateY(0)" : "translateY(30px)",
    willChange: "opacity, transform" as const,
  });

  return (
    <footer
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center font-sans rounded-t-[48px] -mt-8 z-10 shadow-[0_-24px_60px_-16px_rgba(0,0,0,0.4)] p-3 sm:p-5 md:p-8"
      style={{
        // Dark bezel around the "laptop screen".
        background: "#181818",
      }}
    >
      {/* The "screen" — everything inside looks like it's rendered on a device */}
      <div
        ref={screenRef}
        className="relative w-full h-full max-w-[1500px] rounded-[28px] overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(180deg, #FF8233 0%, #FDAC55 100%)",
          // Contain mix-blend-mode of the video within the screen.
          isolation: "isolate",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* Background wordmark + oval — fades + zooms in as a group */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: entered ? 0.8 : 0,
            transform: entered ? "scale(1)" : "scale(0.9)",
            transition:
              "opacity 1400ms cubic-bezier(0.22,1,0.36,1) 220ms, transform 1400ms cubic-bezier(0.22,1,0.36,1) 220ms",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 95%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 40%, transparent 95%)",
            willChange: "opacity, transform",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={bgTextRef}
              className="text-white font-black leading-none tracking-tighter whitespace-nowrap"
              style={{
                fontSize: "clamp(180px, 40vw, 700px)",
                transform: `scale(1.15, ${(scaleY * 1.4).toFixed(3)})`,
                transformOrigin: "center",
              }}
            >
              COFE
            </div>
            <div
              className="absolute rounded-full bg-white h-[22vh] sm:h-[26vh] md:h-[50vh]"
              style={{
                width: "clamp(120px, 18vw, 380px)",
                transform: `scale(1, ${scaleY.toFixed(3)})`,
                transformOrigin: "center",
              }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav
          className="relative z-20 flex flex-row items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5"
          style={enter(180)}
        >
          <div className="flex items-center">
            <LogoDots />
            <span className="text-white font-bold text-lg sm:text-xl ml-1">
              cofe
            </span>
          </div>

          <div className="hidden md:flex flex-row gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-white hover:opacity-90 transition-colors no-underline"
                style={{ color: "#F16524" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-white hover:opacity-90 transition-colors"
            style={{ backgroundColor: "#F16524" }}
          >
            <Menu className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Menu</span>
          </button>
        </nav>

        {/*
          Center video. IMPORTANT: no transform / opacity / will-change on this
          wrapper — any of those create a new stacking context that isolates
          the video's mix-blend-mode and leaves the video's own white
          background visible.
        */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ marginTop: "calc(-3% - 20px)" }}
        >
          <div className="w-[110%] h-[80%] sm:w-[80%] sm:h-[78%] md:w-[70%] md:h-[85%]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain pointer-events-none"
              style={{ mixBlendMode: "darken" }}
              src={VIDEO_URL}
            />
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-30 mt-auto pb-6 sm:pb-10 md:pb-14 flex flex-col items-center text-center px-4">
          <h2
            className="text-white text-lg sm:text-xl md:text-2xl font-medium mb-3 sm:mb-4"
            style={enter(720)}
          >
            Ready to run private payroll?
          </h2>
          <a
            href={LAUNCH_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-base no-underline hover:scale-105 hover:shadow-lg transition-all"
            style={{ backgroundColor: "#F16524", ...enter(920) }}
          >
            Launch app
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </a>
        </div>
      </div>

      {/* Mobile menu overlay — fixed to viewport, sits above the "laptop" */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-full sm:w-[380px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            background: "linear-gradient(135deg, #FF6B1A 0%, #FF9642 100%)",
          }}
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center">
              <LogoDots />
              <span className="text-white font-bold text-lg sm:text-xl ml-1">
                cofe
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 px-6 mt-2">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-4 text-lg font-semibold text-white rounded-2xl bg-white/10 hover:bg-white/20 no-underline"
                style={{
                  transitionProperty: "opacity, transform, background-color",
                  transitionDuration: "300ms",
                  transitionDelay: isMenuOpen ? `${150 + i * 60}ms` : "0ms",
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? "translateY(0)" : "translateY(16px)",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full py-4 rounded-full bg-white font-semibold text-base flex items-center justify-center gap-2 hover:scale-[1.02]"
              style={{
                color: "#F16524",
                transitionProperty: "opacity, transform",
                transitionDuration: "300ms",
                transitionDelay: isMenuOpen ? "450ms" : "0ms",
                opacity: isMenuOpen ? 1 : 0,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
