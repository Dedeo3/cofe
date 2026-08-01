import Reveal from "./Reveal";

type FooterLink = { label: string; href: string; external?: boolean };

function LogoDots() {
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-2 h-2 bg-[#fdf1e1] rounded-full" />
      ))}
    </div>
  );
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="footer-col">
      <p className="footer-col-title">{title}</p>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function Footer({
  launchAppUrl,
  links,
}: {
  launchAppUrl: string;
  links: { product: FooterLink[]; resources: FooterLink[] };
}) {
  return (
    <footer className="closing" aria-label="Call to action">
      <Reveal>
        <p className="eyebrow">Ready when you are</p>
        <h2>
          Ready to run private payroll?
          <br />
          <span className="muted">Your Safe already can.</span>
        </h2>
        <p className="hero-copy">
          Connect the Safe you already trust, encrypt salaries client-side, and settle
          payroll without ever putting numbers on-chain in the clear.
        </p>
        <a
          className="cta-button"
          href={launchAppUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Launch app
          <span aria-hidden="true">↗</span>
        </a>
      </Reveal>

      <div className="footer-links">
        <LinkColumn title="Product" links={links.product} />
        <LinkColumn title="Resources" links={links.resources} />
      </div>

      <div className="closing-meta">
        <LogoDots />
        <span>cofe &middot; Sepolia &middot; iExec WTF Hackathon 2026</span>
      </div>
    </footer>
  );
}
