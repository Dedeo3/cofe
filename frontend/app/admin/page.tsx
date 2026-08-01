"use client";

import { useState } from "react";
import { Interface } from "ethers";
import { useWallet } from "../../lib/WalletContext";
import { PAYROLL_VAULT_ABI, PAYROLL_VAULT_ADDRESS, CONFIDENTIAL_USDC_ADDRESS, SAFE_ADDRESS, CHAIN_ID } from "../../lib/contracts";

// @safe-global/protocol-kit + api-kit alone push this route's first-load JS
// from ~100KB to 1.2MB. Both are CJS-only (needing a defensive .default
// unwrap under this project's ESM setup regardless of import style), so
// loading them dynamically inside runPayroll() — only once the button is
// actually clicked — keeps the initial page load light.
async function loadSafeSdk() {
  const [{ default: SafeSdkPkg }, { default: SafeApiKitPkg }] = await Promise.all([
    import("@safe-global/protocol-kit"),
    import("@safe-global/api-kit"),
  ]);
  const Safe: typeof SafeSdkPkg = (SafeSdkPkg as any).default ?? SafeSdkPkg;
  const SafeApiKit: typeof SafeApiKitPkg = (SafeApiKitPkg as any).default ?? SafeApiKitPkg;
  return { Safe, SafeApiKit };
}

type Row = { employee: string; amount: string };

export default function AdminPage() {
  const { address, connect } = useWallet();
  const [rows, setRows] = useState<Row[]>([{ employee: "", amount: "" }]);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function handleConnect() {
    setStatus("");
    try {
      await connect();
    } catch (err: any) {
      setStatus(err.message ?? String(err));
    }
  }

  function updateRow(i: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { employee: "", amount: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function runPayroll() {
    setStatus("");
    setBusy(true);
    try {
      const { address: ownerAddress, provider } = await connect();
      const { createEthersHandleClient } = await import("@iexec-nox/handle");

      // Proofs are bound to (app, owner) = the contract and msg.sender active
      // when the proof is consumed. runPayroll() forwards the proof into
      // ConfidentialUSDC.confidentialTransferFrom(), which is what actually
      // calls Nox.fromExternal() — so app = ConfidentialUSDC, and owner =
      // PayrollVault (the contract that calls confidentialTransferFrom).
      // Neither is the connected wallet, so we bind against a minimal
      // duck-typed "signer" that only needs to report the Vault's address.
      // `provider` must be an ethers Provider (getNetwork/getBlockNumber),
      // not the raw injected window.ethereum — connectWallet() already
      // wraps it in a BrowserProvider, so reuse that.
      const vaultOwnerClient = { getAddress: async () => PAYROLL_VAULT_ADDRESS, provider };
      const handleClient = await createEthersHandleClient(vaultOwnerClient as any);

      const employees: string[] = [];
      const encryptedAmounts: string[] = [];
      const inputProofs: string[] = [];

      for (const row of rows) {
        if (!row.employee || !row.amount) continue;
        // amount is entered in whole USDC (e.g. "2500.00") — convert to
        // 6-decimal smallest units before encrypting.
        const smallestUnits = BigInt(Math.round(Number(row.amount) * 1_000_000));
        setStatus(`Encrypting salary for ${row.employee}...`);
        const { handle, handleProof } = await handleClient.encryptInput(
          smallestUnits,
          "uint256",
          CONFIDENTIAL_USDC_ADDRESS,
        );
        employees.push(row.employee);
        encryptedAmounts.push(handle);
        inputProofs.push(handleProof);
      }

      if (employees.length === 0) {
        setStatus("Add at least one employee + amount first.");
        return;
      }

      // PayrollVault's admin is the Safe itself, not this wallet directly —
      // runPayroll() must be submitted as a Safe transaction. Since the
      // connected wallet needs to be a Safe owner, the wallet prompts for
      // an EIP-712 signature (and, if threshold is 1, the execution tx too).
      const vaultInterface = new Interface(PAYROLL_VAULT_ABI);
      const data = vaultInterface.encodeFunctionData("runPayroll", [employees, encryptedAmounts, inputProofs]);

      setStatus("Connecting to Safe...");
      const { Safe, SafeApiKit } = await loadSafeSdk();
      const protocolKit = await Safe.init({ provider: window.ethereum, signer: ownerAddress, safeAddress: SAFE_ADDRESS });
      const threshold = await protocolKit.getThreshold();

      const safeTransaction = await protocolKit.createTransaction({
        transactions: [{ to: PAYROLL_VAULT_ADDRESS, value: "0", data }],
      });

      setStatus("Sign the Safe transaction in your wallet...");
      const signedSafeTransaction = await protocolKit.signTransaction(safeTransaction);

      if (threshold === 1) {
        setStatus(`Submitting payroll for ${employees.length} employee(s)...`);
        const execResult = await protocolKit.executeTransaction(signedSafeTransaction);
        setStatus(`Tx submitted: ${execResult.hash} — waiting for confirmation...`);
        await provider.waitForTransaction(execResult.hash);
        setStatus(`Payroll run complete for ${employees.length} employee(s). Amounts stayed confidential end-to-end.`);
        return;
      }

      setStatus(`Safe threshold is ${threshold} — proposing transaction for co-signers...`);
      const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
      const senderSignature = signedSafeTransaction.getSignature(ownerAddress);
      if (!senderSignature) {
        throw new Error("Failed to produce owner signature for the Safe transaction.");
      }
      const apiKit = new SafeApiKit({ chainId: BigInt(CHAIN_ID) });
      await apiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: signedSafeTransaction.data,
        safeTxHash,
        senderAddress: ownerAddress,
        senderSignature: senderSignature.data,
      });
      setStatus(
        `Proposed (hash ${safeTxHash}). Other Safe owners must confirm at app.safe.global (Sepolia) before it executes.`,
      );
    } catch (err: any) {
      setStatus(`Error: ${err.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <div className="tag">Admin console</div>
      <h1 style={{ fontSize: "1.9rem" }}>Run payroll</h1>

      <div className="card">
        {!address ? (
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect wallet
          </button>
        ) : (
          <p style={{ fontFamily: "var(--mono)", fontSize: "0.85rem" }}>Connected: {address}</p>
        )}

        <table style={{ marginTop: "1.25rem" }}>
          <thead>
            <tr>
              <th scope="col">Employee address</th>
              <th scope="col">Amount (USDC)</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="field"
                    style={{ width: "100%" }}
                    placeholder="0x…"
                    aria-label={`Employee ${i + 1} address`}
                    autoComplete="off"
                    spellCheck={false}
                    value={row.employee}
                    onChange={(e) => updateRow(i, "employee", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="field"
                    style={{ width: "100%" }}
                    type="text"
                    inputMode="decimal"
                    placeholder="2500.00"
                    aria-label={`Employee ${i + 1} amount in USDC`}
                    autoComplete="off"
                    value={row.amount}
                    onChange={(e) => updateRow(i, "amount", e.target.value)}
                  />
                </td>
                <td>
                  <button className="icon-btn" onClick={() => removeRow(i)} aria-label={`Remove employee ${i + 1}`}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn" onClick={addRow} style={{ marginTop: "0.75rem" }}>
          + Add employee
        </button>

        <div style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-primary" onClick={runPayroll} disabled={busy || !PAYROLL_VAULT_ADDRESS}>
            {busy ? "Running…" : "Encrypt & run payroll"}
          </button>
        </div>

        {!PAYROLL_VAULT_ADDRESS && (
          <p className="status status-error">NEXT_PUBLIC_PAYROLL_VAULT_ADDRESS is not set — check .env.local.</p>
        )}

        <div aria-live="polite">{status && <p className="status">{status}</p>}</div>
      </div>
    </main>
  );
}
