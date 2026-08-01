"use client";

import { useWallet } from "../lib/WalletContext";

export default function WalletButton() {
  const { address, connecting, connect, disconnect } = useWallet();

  if (!address) {
    return (
      <button className="btn btn-primary" onClick={() => connect().catch(() => {})} disabled={connecting}>
        {connecting ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: "0.82rem", color: "var(--text-dim)" }}>{short}</span>
      <button className="btn" onClick={disconnect}>
        Disconnect
      </button>
    </div>
  );
}
