"use client";

import { useEffect } from "react";
import HeroReveal from "@/components/HeroReveal";
import Footer from "@/components/Footer";

const SIGHT_CARDS: {
  aria: string;
  kicker: string;
  title: string;
  copy: string;
  pin: string;
}[] = [
  {
    aria: "Open wrap step card",
    kicker: "Step 01",
    title: "Wrap USDC",
    copy: "Safe wraps public USDC into confidential cUSDC. Only the aggregate budget is visible on-chain.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png",
  },
  {
    aria: "Open authorize step card",
    kicker: "Step 02",
    title: "Grant operator",
    copy: "Safe calls setOperator on cUSDC with an expiry. Custody never leaves the multisig.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png",
  },
  {
    aria: "Open encrypt step card",
    kicker: "Step 03",
    title: "Encrypt salaries",
    copy: "Admin encrypts each amount client-side with the @iexec-nox/handle SDK before submitting.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png",
  },
  {
    aria: "Open settle step card",
    kicker: "Step 04",
    title: "Run payroll",
    copy: "PayrollVault calls confidentialTransferFrom per employee. Amounts stay opaque handles on-chain.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png",
  },
  {
    aria: "Open redeem step card",
    kicker: "Step 05",
    title: "Unwrap privately",
    copy: "Employees decrypt their own balance and unwrap cUSDC back to USDC whenever they want liquidity.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png",
  },
];

const PAYROLL_VAULT_SEPOLIA =
  "https://sepolia.etherscan.io/address/0xe7b082bc8f9022f66b0cadf6d2548ffaeb441489";

// TODO: swap for the deployed frontend URL once it's live (currently local-only).
const LAUNCH_APP_URL = "http://localhost:3001";

export default function Home() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".cinema-scroll");
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sightsTrack = document.querySelector<HTMLElement>(".sights-track");
    const sightsControls = document.querySelector<HTMLElement>(".sights-controls");
    const sightPrev = document.querySelector<HTMLButtonElement>(".sight-prev");
    const sightNext = document.querySelector<HTMLButtonElement>(".sight-next");
    const originalSightCards = Array.from(
      document.querySelectorAll<HTMLElement>(".sight-card")
    );

    if (!section || !sightsTrack) return;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let initialized = false;
    let rafPending = false;
    let sightCards: HTMLElement[] = [];
    const originalSightCount = originalSightCards.length;
    let activeSight = originalSightCount;

    const clamp = (v: number, min = 0, max = 1) =>
      Math.min(max, Math.max(min, v));
    const smoothstep = (e0: number, e1: number, v: number) => {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const segmentInOut = (
      s: number,
      a: number,
      b: number,
      c: number,
      d: number
    ) => {
      const enter = smoothstep(a, b, s);
      const exit = smoothstep(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    };
    const getScrollDistance = () =>
      clamp(
        -section.getBoundingClientRect().top,
        0,
        section.offsetHeight - window.innerHeight
      );

    const setVar = (name: string, value: string | number) => {
      root.style.setProperty(name, String(value));
    };

    function update() {
      rafPending = false;

      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08)
        smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
      const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
      const progress = clamp(smoothScroll / 2700);
      const introExit = smoothstep(90, 650, smoothScroll);
      const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
      const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
      const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active * (1 - frame3.exit);
      const backScale =
        0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;
      const sightsScreenTop =
        Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
      const sightsParentTop =
        window.innerHeight -
        (window.innerHeight - sightsScreenTop) / backScale;

      setVar("--mx", (reduceMotion.matches ? 0 : mouseX).toFixed(4));
      setVar("--my", (reduceMotion.matches ? 0 : mouseY).toFixed(4));

      setVar("--back-opacity", 1 - frame2.active * 0.06);
      setVar("--back-x", `${mouseX * -12}px`);
      setVar("--back-y", `${mouseY * -4}px`);
      setVar("--back-scale", backScale);
      setVar("--four-y", `${10 + progress * 10}vh`);
      setVar("--four-scale", 0.78 + progress * 0.16);
      setVar("--bazaar-y", `${20 - progress * 8}vh`);
      setVar("--blur-px", `${blurActive * 14}px`);
      setVar("--back-brightness", 1 - blurActive * 0.255);
      setVar("--bazaar-blur-px", `${frame2.active * 14}px`);
      setVar(
        "--bazaar-brightness",
        1 - frame2.active * 0.255 - frame3.active * 0.06
      );
      setVar("--bazaar-saturation", 1 + frame3.active * 0.18);
      setVar("--shade-opacity", "1");
      setVar("--shade-z", frame2.active > 0.02 ? "2" : "0");
      setVar("--shade-top-alpha", blurActive * 0.465);
      setVar("--shade-mid-alpha", blurActive * 0.42);
      setVar("--shade-bottom-alpha", blurActive * 0.51);

      setVar("--title-y", `${introExit * -210}px`);
      setVar("--title-scale", 1 - introExit * 0.08);
      setVar("--title-opacity", 1 - introExit);

      setVar("--bridge-x", `calc(-50% + ${mouseX * 18}px)`);
      setVar(
        "--bridge-y",
        `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`
      );
      setVar("--bridge-bottom", `${5 - frame2.enter * 13}vh`);
      setVar("--bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
      setVar("--bridge-scale", 1.02 + sharedHeroScale + frame2.exit * 0.46);

      setVar(
        "--split-left-x",
        `calc(-50% + ${-splitDrift * 46}vw + ${mouseX * 22}px)`
      );
      setVar(
        "--split-left-y",
        `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`
      );
      setVar("--split-left-scale", 1 + sharedHeroScale + frame2.enter * 0.74);
      setVar(
        "--split-right-x",
        `calc(-50% + ${splitDrift * 46}vw + ${mouseX * 22}px)`
      );
      setVar(
        "--split-right-y",
        `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`
      );
      setVar("--split-right-scale", 1 + sharedHeroScale + frame2.enter * 0.74);

      setVar("--frame2-opacity", frame2Opacity);
      setVar("--frame2-x", `calc(-50% + ${mouseX * 10}px)`);
      setVar(
        "--frame2-y",
        `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`
      );
      setVar(
        "--frame2-scale",
        1.06 + frame2.enter * 0.08 + frame2.exit * 0.08
      );

      setVar("--intro-copy-y", `${introExit * 90}px`);
      setVar("--intro-copy-opacity", 1 - introExit);
      setVar("--panel2-opacity", panel2Opacity);
      setVar(
        "--panel2-y",
        `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`
      );
      setVar("--panel3-opacity", panel3Opacity);
      setVar(
        "--panel3-y",
        `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`
      );

      setVar("--sights-opacity", sightsEnter);
      setVar("--sights-controls-opacity", sightsControlsEnter);
      sightsControls?.classList.toggle("is-ready", sightsControlsEnter > 0.98);
      setVar("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
      setVar("--sights-y", "0px");
      setVar("--sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
      setVar("--sights-scale", 1 / backScale);
      setVar("--sights-top", `${sightsParentTop}px`);
      setVar("--sights-screen-top", `${sightsScreenTop}px`);

      if (
        Math.abs(smoothScroll - targetScroll) > 0.08 ||
        Math.abs(mouseX - targetMouseX) > 0.001 ||
        Math.abs(mouseY - targetMouseY) > 0.001
      ) {
        requestTick();
      }
    }

    function requestTick() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(update);
    }

    function updateSightSlider() {
      if (!sightCards.length || !sightsTrack) return;
      const cardWidth = sightCards[0].offsetWidth;
      const gap =
        parseFloat(getComputedStyle(sightsTrack).columnGap || "0") || 0;
      setVar("--sights-shift", `${-(cardWidth + gap) * activeSight}px`);
      sightCards.forEach((card, i) => {
        card.classList.toggle("is-active", i === activeSight);
      });
    }

    function moveSightSlider(dir: number) {
      activeSight += dir;
      updateSightSlider();
    }

    function selectSightCard(card: HTMLElement) {
      const idx = Number(card.dataset.sightIndex);
      if (Number.isFinite(idx)) {
        activeSight = idx;
        updateSightSlider();
      }
    }

    function jumpSightSlider(i: number) {
      sightsTrack?.classList.add("is-jumping");
      activeSight = i;
      updateSightSlider();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sightsTrack?.classList.remove("is-jumping");
        });
      });
    }

    function normalizeSightSlider() {
      if (activeSight >= originalSightCount * 2) {
        jumpSightSlider(activeSight - originalSightCount);
      } else if (activeSight < originalSightCount) {
        jumpSightSlider(activeSight + originalSightCount);
      }
    }

    function setupSightSlider() {
      if (!sightsTrack) return;
      sightsTrack.replaceChildren();
      for (let setIndex = 0; setIndex < 3; setIndex++) {
        originalSightCards.forEach((card, cardIndex) => {
          const clone = card.cloneNode(true) as HTMLElement;
          clone.dataset.sightIndex = String(
            setIndex * originalSightCount + cardIndex
          );
          sightsTrack.appendChild(clone);
        });
      }
      sightCards = Array.from(
        sightsTrack.querySelectorAll<HTMLElement>(".sight-card")
      );
      activeSight = originalSightCount;

      sightCards.forEach((card) => {
        card.addEventListener("click", () => selectSightCard(card));
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectSightCard(card);
          }
        });
      });

      sightsTrack.addEventListener("transitionend", normalizeSightSlider);
      updateSightSlider();
    }

    const onScroll = () => requestTick();
    const onResize = () => {
      updateSightSlider();
      requestTick();
    };
    const onPointerMove = (event: PointerEvent) => {
      targetMouseX = event.clientX / window.innerWidth - 0.5;
      targetMouseY = event.clientY / window.innerHeight - 0.5;
      requestTick();
    };
    const onPrev = () => moveSightSlider(-1);
    const onNext = () => moveSightSlider(1);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    sightPrev?.addEventListener("click", onPrev);
    sightNext?.addEventListener("click", onNext);

    setupSightSlider();
    requestTick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      sightPrev?.removeEventListener("click", onPrev);
      sightNext?.removeEventListener("click", onNext);
      sightsTrack?.removeEventListener("transitionend", normalizeSightSlider);
    };
  }, []);

  const openContracts = () => {
    window.open(PAYROLL_VAULT_SEPOLIA, "_blank", "noopener");
  };

  return (
    <main className="site-shell">
      <section
        className="cinema-scroll"
        id="cinema"
        aria-label="Confidential payroll cinematic scroll story"
      >
        <div className="stage">
          <div className="world">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="scene-img sky-img"
              alt=""
              src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png"
            />

            <header className="site-header" aria-label="Primary navigation">
              <a className="site-logo" href="#cinema">
                Confidential Safe Payroll
              </a>
              <nav className="site-nav" aria-label="Main menu">
                <a href="#cinema">Overview</a>
                <a href="#bridge">Custody</a>
                <a href="#bazaar">Employees</a>
                <a href="#routes">Flow</a>
              </nav>
              <a
                className="language-switcher"
                href={LAUNCH_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Launch app"
              >
                <span>Launch app</span>
                <span aria-hidden="true">↗</span>
              </a>
            </header>

            <div className="back-stack">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="scene-img back-img back-four"
                alt=""
                src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png"
              />

              <section
                className="sights-slider"
                aria-label="Payroll flow steps slider"
              >
                <div className="sights-track">
                  {SIGHT_CARDS.map((card, i) => (
                    <article
                      key={i}
                      className="sight-card"
                      tabIndex={0}
                      role="button"
                      aria-label={card.aria}
                    >
                      <span className="sight-kicker">{card.kicker}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="sight-pin" alt="" src={card.pin} />
                      <h3>{card.title}</h3>
                      <p>{card.copy}</p>
                    </article>
                  ))}
                </div>
              </section>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="scene-img back-img back-bazaar"
                alt=""
                src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png"
              />
            </div>

            <div className="sights-controls" aria-label="Slider controls">
              <button
                className="sight-nav sight-prev"
                type="button"
                aria-label="Previous step"
              >
                ←
              </button>
              <button
                className="sight-nav sight-next"
                type="button"
                aria-label="Next step"
              >
                →
              </button>
            </div>

            <h1 className="hero-title">PAYROLL</h1>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="scene-img splitframe-img splitframe-left"
              alt=""
              src="https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="scene-img splitframe-img splitframe-right"
              alt=""
              src="https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="scene-img bridge-img"
              alt=""
              src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="scene-img frame-two-img"
              alt=""
              src="https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png"
            />

            <div className="shade" />
          </div>

          <section
            className="intro-copy"
            aria-label="Confidential payroll overview"
          >
            <p>
              Your team gets paid on-chain. What each of them earns stays
              yours &mdash; encrypted end-to-end, settled through the Safe
              multisig you already run.
            </p>
            <div className="hero-tags" aria-label="Payroll highlights">
              <span>Gnosis Safe</span>
              <span>iExec Nox</span>
              <span>ERC-7984</span>
            </div>
          </section>

          <section
            className="story-panel story-panel-bridge"
            aria-label="Custody details"
          >
            <h2>The Safe never lets go.</h2>
            <p>
              PayrollVault runs confidential transfers as an operator on your
              existing Safe. No fork, no upgrade, no custody handoff &mdash;
              funds stay in the multisig you already trust.
            </p>
            <dl className="facts">
              <div>
                <dt>0</dt>
                <dd>Changes required to Gnosis Safe</dd>
              </div>
              <div>
                <dt>5</dt>
                <dd>Steps from wrap to private redeem</dd>
              </div>
            </dl>
          </section>

          <section
            className="story-panel story-panel-bazaar"
            aria-label="Employee redemption details"
          >
            <h2>Only the wallet decrypts.</h2>
            <p>
              Each balance lives on-chain as an opaque handle. Employees
              decrypt privately through the Nox handle SDK &mdash; you
              can&rsquo;t see it, and neither can the chain.
            </p>
            <button
              className="note-button"
              type="button"
              onClick={openContracts}
            >
              <span aria-hidden="true">↗</span>
              <span>Open Sepolia contracts</span>
            </button>
          </section>
        </div>
      </section>

      <HeroReveal />

      <Footer />
    </main>
  );
}
