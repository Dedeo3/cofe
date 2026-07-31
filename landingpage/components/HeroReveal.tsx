"use client";

import { useEffect, useRef } from "react";
import Hero from "./Hero";

const START_SCALE = 0.28;
const START_RADIUS = 72;
const START_SHADOW_Y = 60;
const START_SHADOW_BLUR = 140;
const START_SHADOW_ALPHA = 0.55;

// Total section height sets the scroll runway. Sticky child is 100vh,
// so scaling travel = REVEAL_HEIGHT_VH - 100.
const REVEAL_HEIGHT_VH = 220;

export default function HeroReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rafPendingRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const clamp = (v: number, min = 0, max = 1) =>
      Math.min(max, Math.max(min, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const update = () => {
      rafPendingRef.current = false;

      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      const scrollRange = section.offsetHeight - window.innerHeight;
      const raw = clamp(scrolled / Math.max(1, scrollRange));

      // Ease out cubic — starts snappy, settles smoothly at the end.
      const eased = 1 - Math.pow(1 - raw, 3);

      const scale = lerp(START_SCALE, 1, eased);
      const radius = lerp(START_RADIUS, 0, eased);
      const shadowY = lerp(START_SHADOW_Y, 0, eased);
      const shadowBlur = lerp(START_SHADOW_BLUR, 0, eased);
      const shadowAlpha = lerp(START_SHADOW_ALPHA, 0, eased);

      frame.style.transform = `scale(${scale.toFixed(4)})`;
      frame.style.borderRadius = `${radius.toFixed(2)}px`;
      frame.style.boxShadow = `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(
        1
      )}px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`;
    };

    const request = () => {
      if (rafPendingRef.current) return;
      rafPendingRef.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0b1110]"
      style={{ height: `${REVEAL_HEIGHT_VH}vh` }}
      aria-label="Launch app reveal"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div
          ref={frameRef}
          className="w-screen h-screen origin-center overflow-hidden"
          style={{
            transform: `scale(${START_SCALE})`,
            borderRadius: `${START_RADIUS}px`,
            boxShadow: `0 ${START_SHADOW_Y}px ${START_SHADOW_BLUR}px rgba(0, 0, 0, ${START_SHADOW_ALPHA})`,
            willChange: "transform, border-radius, box-shadow",
            backfaceVisibility: "hidden",
          }}
        >
          <Hero />
        </div>
      </div>
    </section>
  );
}
