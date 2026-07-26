"use client";

import { useState } from "react";
import { Contract } from "ethers";
import { createEthersHandleClient } from "@iexec-nox/handle";
import { connectWallet } from "../../lib/wallet";
import { PAYROLL_VAULT_ABI, PAYROLL_VAULT_ADDRESS } from "../../lib/contracts";

type Row = { employee: string; amount: string };

export default function AdminPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([{ employee: "", amount: "" }]);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function handleConnect() {
    setStatus("");
    try {
      const { address } = await connectWallet();
      setAddress(address);
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
      const { signer } = await connectWallet();
      const handleClient = await createEthersHandleClient(signer);

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
          PAYROLL_VAULT_ADDRESS,
        );
        employees.push(row.employee);
        encryptedAmounts.push(handle);
        inputProofs.push(handleProof);
      }

      if (employees.length === 0) {
        setStatus("Add at least one employee + amount first.");
        return;
      }

      setStatus(`Submitting payroll for ${employees.length} employee(s)...`);
      const vault = new Contract(PAYROLL_VAULT_ADDRESS, PAYROLL_VAULT_ABI, signer);
      const tx = await vault.runPayroll(employees, encryptedAmounts, inputProofs);
      setStatus(`Tx submitted: ${tx.hash} — waiting for confirmation...`);
      await tx.wait();
      setStatus(`Payroll run complete for ${employees.length} employee(s). Amounts stayed confidential end-to-end.`);
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
              <th>Employee address</th>
              <th>Amount (USDC)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="field"
                    style={{ width: "100%" }}
                    placeholder="0x..."
                    value={row.employee}
                    onChange={(e) => updateRow(i, "employee", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="field"
                    style={{ width: "100%" }}
                    placeholder="2500.00"
                    value={row.amount}
                    onChange={(e) => updateRow(i, "amount", e.target.value)}
                  />
                </td>
                <td>
                  <button className="icon-btn" onClick={() => removeRow(i)} aria-label="Remove row">
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
            {busy ? "Running..." : "Encrypt & run payroll"}
          </button>
        </div>

        {!PAYROLL_VAULT_ADDRESS && (
          <p className="status status-error">NEXT_PUBLIC_PAYROLL_VAULT_ADDRESS is not set — check .env.local.</p>
        )}

        {status && <p className="status">{status}</p>}
      </div>
    </main>
  );
}
