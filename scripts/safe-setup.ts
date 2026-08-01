import "dotenv/config";
import { ethers } from "ethers";
import SafeSdkPkg from "@safe-global/protocol-kit";
import SafeApiKitPkg from "@safe-global/api-kit";

// Both packages are CJS-only; under this project's "type": "module", a plain
// default import binds to the whole `module.exports`, not the inner class —
// but their .d.ts files assume esModuleInterop, so TS doesn't know about the
// extra nesting. Unwrap defensively so this works under either interop.
const Safe: typeof SafeSdkPkg = (SafeSdkPkg as any).default ?? SafeSdkPkg;
const SafeApiKit: typeof SafeApiKitPkg = (SafeApiKitPkg as any).default ?? SafeApiKitPkg;

/**
 * One-time (or top-up) Safe setup: approve the underlying stablecoin to
 * ConfidentialUSDC, wrap it into cUSDC held by the Safe, then authorize
 * PayrollVault as an ERC-7984 operator on the Safe's confidential balance.
 * All three calls are batched into a single Safe transaction so they either
 * all land or none do.
 */
const SEPOLIA_CHAIN_ID = 11155111n;
const WRAP_AMOUNT = 10_000_000_000n; // 10,000.00 (6 decimals) — buffer for several payroll runs
const OPERATOR_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

const ERC20_ABI = ["function approve(address spender, uint256 amount) external returns (bool)"];
const WRAPPER_ABI = [
  "function wrap(address to, uint256 amount) external returns (uint256)",
  "function setOperator(address operator, uint48 until) external",
];

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const signerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const safeAddress = process.env.SAFE_ADDRESS;
  const usdcAddress = process.env.USDC_ADDRESS;
  const cUsdcAddress = process.env.CONFIDENTIAL_USDC_ADDRESS;
  const vaultAddress = process.env.PAYROLL_VAULT_ADDRESS;
  if (!rpcUrl || !signerPrivateKey || !safeAddress || !usdcAddress || !cUsdcAddress || !vaultAddress) {
    throw new Error(
      "Set SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, SAFE_ADDRESS, USDC_ADDRESS, CONFIDENTIAL_USDC_ADDRESS and PAYROLL_VAULT_ADDRESS in .env first."
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const ownerSigner = new ethers.Wallet(signerPrivateKey, provider);

  const erc20 = new ethers.Interface(ERC20_ABI);
  const wrapper = new ethers.Interface(WRAPPER_ABI);
  const until = Math.floor(Date.now() / 1000) + OPERATOR_EXPIRY_SECONDS;

  const transactions = [
    { to: usdcAddress, value: "0", data: erc20.encodeFunctionData("approve", [cUsdcAddress, WRAP_AMOUNT]) },
    { to: cUsdcAddress, value: "0", data: wrapper.encodeFunctionData("wrap", [safeAddress, WRAP_AMOUNT]) },
    { to: cUsdcAddress, value: "0", data: wrapper.encodeFunctionData("setOperator", [vaultAddress, until]) },
  ];

  const protocolKit = await Safe.init({ provider: rpcUrl, signer: signerPrivateKey, safeAddress });
  const threshold = await protocolKit.getThreshold();

  const safeTransaction = await protocolKit.createTransaction({ transactions });
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signedSafeTransaction = await protocolKit.signTransaction(safeTransaction);

  if (threshold === 1) {
    console.log("Safe threshold is 1 — executing approve+wrap+setOperator batch directly...");
    const execResult = await protocolKit.executeTransaction(signedSafeTransaction);
    console.log("Setup tx submitted:", execResult.hash);
    await provider.waitForTransaction(execResult.hash);
    console.log(
      `Safe now holds ${WRAP_AMOUNT} cUSDC (raw units) and PayrollVault is an operator until ${new Date(
        until * 1000
      ).toISOString()}.`
    );
    return;
  }

  console.log(`Safe threshold is ${threshold} — proposing batch for co-signers...`);
  const apiKit = new SafeApiKit({ chainId: SEPOLIA_CHAIN_ID });
  const senderSignature = signedSafeTransaction.getSignature(await ownerSigner.getAddress());
  if (!senderSignature) {
    throw new Error("Failed to produce owner signature for the Safe transaction.");
  }
  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: signedSafeTransaction.data,
    safeTxHash,
    senderAddress: await ownerSigner.getAddress(),
    senderSignature: senderSignature.data,
  });
  console.log(`Proposed. safeTxHash: ${safeTxHash}`);
  console.log(`Other owners must confirm at https://app.safe.global (Sepolia) before this executes.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
