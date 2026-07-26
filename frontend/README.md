# Frontend (Phase 4 — not started)

Planned as a small Next.js app with two views:

- **Admin view** — connect wallet (the payroll admin's EOA, not the Safe itself),
  input employee list + salaries, encrypt each amount client-side with
  `@iexec-nox/handle`'s `createEthersHandleClient(signer).encryptInput(amount, "uint256", vaultAddress)`,
  then call `PayrollVault.runPayroll(employees, handles, proofs)`.
- **Employee view** — connect wallet, call `ConfidentialUSDC.confidentialBalanceOf(address)`
  and decrypt it for the connected account only via `handleClient.decrypt(balanceHandle)`,
  optionally `unwrap()` to redeem back to plain USDC.

Scaffold with `pnpm create next-app@latest .` inside this folder once Phase 0–3
(contracts deployed to Sepolia) are done, so real contract addresses/ABIs exist
to wire up.
