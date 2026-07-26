# Implementation Plan — Confidential Safe Payroll Module

Sequenced breakdown for building the project described in [readme.md](readme.md).
Work top to bottom — each phase unblocks the next.

> **Update:** the actual Nox packages (`@iexec-nox/nox-protocol-contracts`,
> `@iexec-nox/nox-confidential-contracts`, `@iexec-nox/handle`,
> `@iexec-nox/nox-hardhat-plugin`) have been inspected directly (npm + GitHub source),
> and the architecture below is based on their real, verified APIs — not guessed ones.
> Nox's confidentiality primitive here is the **ERC-7984 confidential token standard**
> (encrypted balances/transfers via TEE-backed handles), not a generic "encrypt any
> struct" tool. Scaffolding for Phases 0–3 is already in the repo.

## Phase 0 — Setup

- [x] Repo structure created: `/contracts`, `/scripts`, `/test`, `/frontend`, `feedback.md`
- [x] `package.json` + `hardhat.config.ts` wired for Hardhat 3 + `@iexec-nox/nox-hardhat-plugin`
- [x] `.env.example` created — **user fills in real values** (`SEPOLIA_RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `SAFE_ADDRESS`, etc.)
- [ ] Run `pnpm install` (needs pnpm ≥10, Node ≥24)
- [ ] Create Sepolia RPC access (Alchemy/Infura) + a funded Sepolia test wallet
- [ ] Create a Safe on Sepolia (via https://app.safe.global, testnet mode) for the "company" payroll account
- [ ] Install Docker (required locally by `@iexec-nox/nox-hardhat-plugin` to run the Nox stack: KMS, ingestor, runner, handle gateway, NATS, S3 — via Docker Compose)

## Phase 1 — Confidential contracts (Nox)

- [x] `contracts/PayrollVault.sol` — orchestrates confidential payroll batches, calling `confidentialTransferFrom` per employee (never custodies funds itself)
- [x] `contracts/ConfidentialUSDC.sol` — concrete `ERC20ToERC7984Wrapper` around the payroll stablecoin
- [x] `contracts/mocks/MockUSDC.sol` — 6-decimal test stablecoin for local runs
- [x] `test/PayrollVault.test.ts` — deployment/wiring test skeleton
- [ ] Run `pnpm test` (needs Docker running for the local Nox stack) and fix any compile issues — this is unverified against a live compiler yet
- [ ] Extend the test to a full flow: wrap → setOperator → encrypt salary via local Nox gateway → `runPayroll` → assert confidential transfer occurred (without asserting on plaintext values on-chain)

## Phase 2 — Safe integration

- [x] Deploy flow assumes the Safe stays custodian: it calls `wrap()` and `setOperator()` itself (see `scripts/deploy.ts` output instructions)
- [ ] Actually perform those two Safe transactions on Sepolia once deployed (via Safe{Wallet} UI, or scripted with `@safe-global/protocol-kit` + `@safe-global/api-kit` if you want it automated)
- [ ] Confirm this works with a **real** multisig flow (not a single EOA masquerading as Safe)

## Phase 3 — Deploy to Sepolia

- [x] `scripts/deploy.ts` — deploys `MockUSDC` (or uses real `USDC_ADDRESS`) + `ConfidentialUSDC` + `PayrollVault`
- [x] `scripts/run-payroll.ts` — encrypts a payroll batch client-side via `@iexec-nox/handle` and calls `runPayroll`
- [ ] Run `pnpm deploy:sepolia` once `.env` is filled in
- [ ] Do one real end-to-end dry run with tiny test amounts (this is your proof it's not mock data)

## Phase 4 — Frontend

- [ ] Admin view: form to input employee list + salaries + bonus rule → encrypts client-side → submits to Nox contract
- [ ] Status view: shows payroll run state (submitted → computed → settled via Safe) without ever displaying plaintext amounts to unauthorized viewers
- [ ] Employee view: an employee can check "was I paid, when, tx hash" without seeing everyone else's data
- [ ] Wallet connect (RainbowKit/wagmi or similar), network guard for Sepolia

## Phase 5 — End-to-end verification

- [ ] Run the full flow live: admin input → encryption → Nox compute → Safe execution → employee receives funds
- [ ] Verify on Sepolia block explorer: transaction is visible, but salary amounts/full recipient breakdown are not derivable from public data
- [ ] Re-test with at least 2 different payroll scenarios (e.g., flat salary + one with bonus logic) to prove it's not a single hardcoded case

## Phase 6 — Documentation & submission deliverables

- [ ] Finalize `readme.md` — installation + usage instructions
- [ ] Write deployment docs (env vars, how to redeploy contracts, how to run frontend locally)
- [ ] Write `feedback.md` — honest notes on the Nox dev experience (friction points, docs gaps, what worked well)
- [ ] Note explicitly what was pre-existing vs. built during the hackathon (required by the rules)
- [ ] Record 4-minute demo video: problem → encrypt → Nox compute → Safe execution → result on Sepolia explorer
- [ ] Publish X/Twitter post tagging `@iEx_ec` with description + demo video + public GitHub link
- [ ] Final check against the evaluation criteria in [readme.md](readme.md) before submitting

## Token-saving tooling while building

- **RTK** is already installed and active — shell/tool output (git, npm, test runs) gets filtered automatically, no extra steps needed.
- **Caveman** (once you install it) compresses my responses during this build — useful for the long implementation stretches (Phases 1–5) where a lot of back-and-forth code review happens. Toggle with `/caveman` when you want terse mode, and back to normal anytime.
