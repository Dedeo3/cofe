# Confidential Safe Payroll Module

> A privacy layer for payroll, built on **Gnosis Safe** + **iExec Nox**.
> Submission for the **iExec WTF (Write The Future) Hackathon — Summer Edition**.

## Why this project

Company payroll run through a Safe multisig today is completely public: salary amounts,
the full list of recipients, and any bonus logic are visible to anyone reading the chain.
That's a real privacy leak for both the company and its employees.

This project adds a **confidential payroll layer on top of Safe** — without modifying Safe
itself — using **Nox**, iExec's confidential smart-contract layer (on-chain contracts +
off-chain Trusted Execution Environments). Payroll inputs are encrypted, processed
privately inside Nox, and only the resulting payment execution is sent through Safe's
public, composable infrastructure.

## What stays private

| Data | Today (plain Safe) | With Nox |
|---|---|---|
| Salary amount per employee | Public | Encrypted / hidden |
| Full recipient list | Public | Not exposed on-chain |
| Bonus rules / calculation logic | Public | Final amount encrypted before submission (see note below) |
| Final on-chain execution | Public (required for settlement) | Public, but reveals no payroll details |

Nothing about the underlying protocol changes: Safe still executes the transaction,
signers still sign, and everything remains composable with the rest of DeFi. Nox only
hides the sensitive inputs that lead up to that execution.

## How it works

Concretely, this is built on iExec's **ERC-7984 confidential token standard**
(`@iexec-nox/nox-confidential-contracts`), not a bespoke encryption scheme:

1. **Wrap** — the company Safe wraps its payroll stablecoin (USDC) into a confidential
   ERC-7984 token, `cUSDC`, via `ConfidentialUSDC.wrap(safe, totalAmount)`. This is a
   normal, public Safe transaction — only the *aggregate* payroll budget is visible,
   never the breakdown.
2. **Authorize** — the Safe calls `cUSDC.setOperator(PayrollVault, expiry)`, a
   time-boxed permission (like ERC-20 `approve`) letting `PayrollVault` move confidential
   balance on the Safe's behalf. The Safe never gives up custody.
3. **Encrypt** — off-chain, the payroll admin encrypts each employee's exact salary
   client-side with `@iexec-nox/handle` (`encryptInput(amount, "uint256", vaultAddress)`),
   producing a `{handle, proof}` pair. The plaintext amount never leaves the admin's
   browser/script unencrypted.
4. **Settle confidentially** — `PayrollVault.runPayroll(employees, handles, proofs)`
   calls `cUSDC.confidentialTransferFrom(safe, employee, handle, proof)` per employee.
   Each transfer moves an *encrypted* amount — visible on-chain only as an opaque handle.
5. **Employees redeem privately** — each employee can `unwrap()` their own `cUSDC` back
   to plain USDC whenever they want liquidity; only they (and the Nox gateway) ever see
   the plaintext amount.

```
   Company Safe (treasury)
        │  wrap() — public: total budget only
        ▼
   ConfidentialUSDC (ERC-7984, cUSDC)
        │  setOperator(PayrollVault) — Safe keeps custody
        ▼
   PayrollVault.runPayroll(employees[], encryptedAmounts[], proofs[])
        │  confidentialTransferFrom — per-employee amount stays encrypted
        ▼
   Employees hold cUSDC → unwrap() privately when they want USDC
```

## Tech stack

- **Nox Protocol** (iExec) — `@iexec-nox/nox-protocol-contracts` (encrypted handles, ACL,
  TEE compute) + `@iexec-nox/nox-confidential-contracts` (ERC-7984 confidential token +
  ERC20↔ERC7984 wrapper)
- **`@iexec-nox/handle`** — client-side SDK for encrypting inputs / decrypting balances
- **Gnosis Safe** — multisig treasury & settlement authority (unmodified)
- **Hardhat 3** + `@iexec-nox/nox-hardhat-plugin` (local Nox stack via Docker for testing)
- **Ethereum Sepolia** — deployment target
- Frontend: Next.js (payroll admin dashboard + employee view) — see [frontend/README.md](frontend/README.md)

See [contracts/PayrollVault.sol](contracts/PayrollVault.sol) and
[contracts/ConfidentialUSDC.sol](contracts/ConfidentialUSDC.sol) for the actual
implementation, and [IMPLEMENTATION.md](IMPLEMENTATION.md) for the build sequence.

## Hackathon context

- **Event:** iExec WTF Hackathon — Summer Edition ("Write The Future")
- **Challenge:** Take a real, existing open-source protocol (not built for privacy) and add
  a privacy layer using Nox, without modifying the underlying protocol.
- **Suggested target used here:** Safe — private payroll / treasury payouts.
- **Prize pool:** $1,500 total (1st $750 / 2nd $500 / 3rd $250).
- **Key rule:** must not reuse a project from the previous Vibe Coding Hackathon.

### Evaluation criteria (from the brief)

- Creativity of the project
- Fully working end-to-end, **no mock data**
- Deployed on **ETH Sepolia**
- `feedback.md` with feedback on iExec tooling
- Demo video, 4 minutes max
- Technical depth of Nox integration
- UX: friendly and intuitive

### Required deliverables

- [ ] Public GitHub repo with complete, open-source code
- [ ] README with install/usage instructions (this file)
- [ ] Deployment documentation
- [ ] Functional frontend
- [ ] Deployed on ETH Sepolia
- [ ] `feedback.md` on the iExec/Nox developer experience
- [ ] 4-minute demo video
- [ ] X (Twitter) post tagging `@iEx_ec`, with description, demo video, and GitHub link

> **Note on bonus logic:** v1 has the admin compute the final salary/bonus figure
> off-chain and encrypt only the result — the *formula* isn't run on-chain. Running the
> bonus calculation itself inside Nox (on encrypted inputs, via the `euint256`
> add/sub/mul primitives in `nox-protocol-contracts`) is a natural v2 extension once the
> basic flow is proven, and would deepen the Nox integration for judging.

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, SAFE_ADDRESS
pnpm compile
pnpm deploy:sepolia
# follow the printed instructions to wrap funds + setOperator from the Safe
pnpm payroll:run
```

Local testing against the full Nox stack (`pnpm test`) requires Docker running —
`@iexec-nox/nox-hardhat-plugin` spins up the KMS/gateway/ingestor services automatically.

## Status

🚧 In progress — contracts (`PayrollVault`, `ConfidentialUSDC`, `MockUSDC`) and scripts
scaffolded and based on the real, published Nox packages. Not yet deployed or tested
end-to-end. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for what's left.

## Resources

- Nox docs: https://docs.iex.ec/nox-protocol/getting-started/welcome
- Nox packages: https://www.npmjs.com/org/iexec-nox?activeTab=packages
- Confidential smart contract wizard: https://cdefi-wizard.iex.ec/
- Nox Hardhat plugin: https://github.com/iExec-Nox/nox-hardhat-plugin
- Nox Hardhat starter: https://github.com/iExec-Nox/nox-hardhat-starter
- iExec links: https://linktr.ee/iexec.tech
