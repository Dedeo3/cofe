"use client";

import { useState } from "react";
import { Contract, formatUnits } from "ethers";
import { connectWallet } from "../../lib/wallet";
import { CONFIDENTIAL_USDC_ABI, CONFIDENTIAL_USDC_ADDRESS } from "../../lib/contracts";

export default function EmployeePage() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function checkBalance() {
    setStatus("");
    setBalance(null);
    setBusy(true);
    try {
      const { signer, address } = await connectWallet();
      setAddress(address);

      const cUsdc = new Contract(CONFIDENTIAL_USDC_ADDRESS, CONFIDENTIAL_USDC_ABI, signer);
      const [balanceHandle, decimals, symbol] = await Promise.all([
        cUsdc.confidentialBalanceOf(address),
        cUsdc.decimals(),
        cUsdc.symbol(),
      ]);

      setStatus("Decrypting your balance (only you can see this)...");
      const { createEthersHandleClient } = await import("@iexec-nox/handle");
      const handleClient = await createEthersHandleClient(signer);
      const { value } = await handleClient.decrypt(balanceHandle);

      setBalance(`${formatUnits(value as bigint, decimals)} ${symbol}`);
      setStatus("");
    } catch (err: any) {
      setStatus(`Error: ${err.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content">
      <div className="tag">Employee portal</div>
      <h1 style={{ fontSize: "1.9rem" }}>Check your balance</h1>
      <p>
        Your confidential balance is stored onchain as an encrypted handle. Only your
        connected wallet can decrypt it — no one else, including whoever ran payroll, can
        read this number from the chain.
      </p>

      <div className="card">
        <button className="btn btn-primary" onClick={checkBalance} disabled={busy || !CONFIDENTIAL_USDC_ADDRESS}>
          {busy ? "Checking…" : "Connect & check my balance"}
        </button>

        {!CONFIDENTIAL_USDC_ADDRESS && (
          <p className="status status-error">NEXT_PUBLIC_CONFIDENTIAL_USDC_ADDRESS is not set — check .env.local.</p>
        )}

        {address && <p style={{ fontFamily: "var(--mono)", fontSize: "0.85rem", marginTop: "1rem" }}>Connected: {address}</p>}
        {balance && <p className="balance">{balance}</p>}
        <div aria-live="polite">{status && <p className="status">{status}</p>}</div>
      </div>
    </main>
  );
}
