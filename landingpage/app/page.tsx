import Image from "next/image";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import HeroIntro from "@/components/HeroIntro";
import SiteHeader from "@/components/SiteHeader";
import CountUp from "@/components/CountUp";

const SIGHT_CARDS: {
  aria: string;
  kicker: string;
  title: string;
  copy: string;
  pin: string;
}[] = [
  {
    aria: "Wrap step",
    kicker: "Step 01",
    title: "Wrap USDC",
    copy: "Safe wraps public USDC into confidential cUSDC. Only the aggregate budget is visible on-chain.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png",
  },
  {
    aria: "Grant operator step",
    kicker: "Step 02",
    title: "Grant operator",
    copy: "Safe calls setOperator on cUSDC with an expiry. Custody never leaves the multisig.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png",
  },
  {
    aria: "Encrypt step",
    kicker: "Step 03",
    title: "Encrypt salaries",
    copy: "Admin encrypts each amount client-side with the @iexec-nox/handle SDK before submitting.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png",
  },
  {
    aria: "Settle step",
    kicker: "Step 04",
    title: "Run payroll",
    copy: "PayrollVault calls confidentialTransferFrom per employee. Amounts stay opaque handles on-chain.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png",
  },
  {
    aria: "Redeem step",
    kicker: "Step 05",
    title: "Unwrap privately",
    copy: "Employees decrypt their own balance and unwrap cUSDC back to USDC whenever they want liquidity.",
    pin: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png",
  },
];

const PAYROLL_VAULT_SEPOLIA =
  "https://sepolia.etherscan.io/address/0xe7b082bc8f9022f66b0cadf6d2548ffaeb441489";
const CONFIDENTIAL_USDC_SEPOLIA =
  "https://sepolia.etherscan.io/address/0x007512c93641cd1fad1477609fe1402e359fe867";
const REPO_URL = "https://github.com/Dedeo3/cofe";

const LAUNCH_APP_URL = "https://cofe-payroll-app.vercel.app";
const ADMIN_URL = `${LAUNCH_APP_URL}/admin`;
const EMPLOYEE_URL = `${LAUNCH_APP_URL}/employee`;

function BrowserFrame({
  url,
  screenshot,
  alt,
}: {
  url: string;
  screenshot: string;
  alt: string;
}) {
  return (
    <div className="browser-frame">
      <div className="browser-chrome" aria-hidden="true">
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-url">{url}</span>
      </div>
      <Image
        className="browser-shot"
        alt={alt}
        src={screenshot}
        width={808}
        height={551}
        sizes="(max-width: 900px) 100vw, 900px"
      />
    </div>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <SiteHeader
        launchAppUrl={LAUNCH_APP_URL}
        contractHref={PAYROLL_VAULT_SEPOLIA}
      />

      <section className="hero" id="hero" aria-label="Confidential payroll overview">
        <div className="hero-grid" aria-hidden="true" />
        <HeroIntro>
          <p className="eyebrow">A privacy layer for onchain payroll</p>
          <h1>Pay your team. Keep the numbers private.</h1>
          <p className="hero-copy">
            Your team gets paid on-chain. What each of them earns stays yours &mdash;
            encrypted end-to-end via iExec Nox, settled through the Safe multisig you
            already run, verifiable on Sepolia.
          </p>
          <div className="hero-tags" aria-label="Payroll highlights">
            <span>Gnosis Safe</span>
            <span>iExec Nox</span>
            <span>ERC-7984</span>
          </div>
          <a
            className="cta-button"
            href={LAUNCH_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Launch app
            <span aria-hidden="true">↗</span>
          </a>
        </HeroIntro>
      </section>

      <div className="trust-bar" aria-label="Live deployment details">
        <span>
          <span className="live-dot" aria-hidden="true" />
          Live on Sepolia
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>iExec WTF Hackathon 2026</span>
        <span aria-hidden="true">&middot;</span>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
      </div>

      <section className="steps" id="steps" aria-label="Payroll flow steps">
        <Reveal>
          <h2>
            Five steps.
            <br />
            <span className="muted">Start to finish.</span>
          </h2>
        </Reveal>
        <div className="steps-grid">
          {SIGHT_CARDS.map((card, i) => (
            <Reveal key={card.kicker} delay={i * 70}>
              <article className="sight-card" aria-label={card.aria}>
                <span className="sight-kicker">{card.kicker}</span>
                <Image className="sight-pin" alt="" src={card.pin} width={44} height={44} />
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="feature-rows" id="preview" aria-label="Product preview">
        <div className="feature-row">
          <Reveal className="feature-text">
            <p className="eyebrow">See it in action</p>
            <h2>
              Built, not mocked.
              <br />
              <span className="muted">Live on Sepolia.</span>
            </h2>
            <p className="hero-copy">
              This is the real Admin console &mdash; encrypting salaries client-side and
              settling payroll through your Safe, not a stitched-together demo.
            </p>
          </Reveal>
          <Reveal className="feature-visual" delay={140}>
            <BrowserFrame
              url="cofe-payroll-app.vercel.app/admin"
              screenshot="/screens/admin-preview.png"
              alt="Confidential Safe Payroll admin console"
            />
          </Reveal>
        </div>

        <div className="feature-row feature-row-reverse">
          <Reveal className="feature-visual">
            <BrowserFrame
              url="cofe-payroll-app.vercel.app/employee"
              screenshot="/screens/employee-preview.png"
              alt="Confidential Safe Payroll employee balance portal"
            />
          </Reveal>
          <Reveal className="feature-text" delay={140}>
            <p className="eyebrow">Only the wallet decrypts</p>
            <h2>
              Private by default.
              <br />
              <span className="muted">Not by request.</span>
            </h2>
            <p className="hero-copy">
              Employees connect their own wallet and decrypt their own balance through the
              Nox handle SDK. No one else &mdash; not even whoever ran payroll &mdash; can
              read the number from the chain.
            </p>
          </Reveal>
        </div>
      </section>

      <Reveal className="trust" delay={0}>
        <section aria-label="Custody details">
          <h2>
            The Safe never lets go.
            <br />
            <span className="muted">No fork, no handoff.</span>
          </h2>
          <p>
            PayrollVault runs confidential transfers as an operator on your existing Safe.
            No fork, no upgrade, no custody handoff &mdash; funds stay in the multisig you
            already trust.
          </p>
          <dl className="facts">
            <div>
              <dt>
                <CountUp value={0} />
              </dt>
              <dd>Changes required to Gnosis Safe</dd>
            </div>
            <div>
              <dt>
                <CountUp value={5} />
              </dt>
              <dd>Steps from wrap to private redeem</dd>
            </div>
          </dl>
          <a
            className="note-button"
            href={PAYROLL_VAULT_SEPOLIA}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">↗</span>
            <span>Open Sepolia contracts</span>
          </a>
        </section>
      </Reveal>

      <Footer
        launchAppUrl={LAUNCH_APP_URL}
        links={{
          product: [
            { label: "Overview", href: "#hero" },
            { label: "Flow", href: "#steps" },
            { label: "Admin", href: ADMIN_URL, external: true },
            { label: "Employee", href: EMPLOYEE_URL, external: true },
          ],
          resources: [
            { label: "Source on GitHub", href: REPO_URL, external: true },
            { label: "PayrollVault contract", href: PAYROLL_VAULT_SEPOLIA, external: true },
            { label: "cUSDC contract", href: CONFIDENTIAL_USDC_SEPOLIA, external: true },
          ],
        }}
      />
    </main>
  );
}
