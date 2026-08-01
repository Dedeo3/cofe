import "dotenv/config";
import { ethers } from "ethers";
import { createEthersHandleClient } from "@iexec-nox/handle";
import SafeSdkPkg from "@safe-global/protocol-kit";
import SafeApiKitPkg from "@safe-global/api-kit";

// Both packages are CJS-only; under this project's "type": "module", a plain
// default import binds to the whole `module.exports`, not the inner class —
// but their .d.ts files assume esModuleInterop, so TS doesn't know about the
// extra nesting. Unwrap defensively so this works under either interop.
const Safe: typeof SafeSdkPkg = (SafeSdkPkg as any).default ?? SafeSdkPkg;
const SafeApiKit: typeof SafeApiKitPkg = (SafeApiKitPkg as any).default ?? SafeApiKitPkg;

/**
 * Example payroll run: encrypts each employee's salary client-side (the
 * amounts below never appear in plaintext on-chain), then submits
 * PayrollVault.runPayroll() as a Safe transaction — since PayrollVault's
 * admin is the Safe itself, this requires the Safe's own multisig threshold
 * to be met before it executes. Replace PAYROLL below with your real payroll
 * sheet before running against Sepolia.
 */
const PAYROLL: { employee: string; amountUsdc: bigint }[] = [
  // amounts are in the token's smallest unit (6 decimals for USDC)
  { employee: "0x0000000000000000000000000000000000000001", amountUsdc: 2_500_000_000n }, // 2,500.00
  { employee: "0x0000000000000000000000000000000000000002", amountUsdc: 3_100_000_000n }, // 3,100.00
];

const PAYROLL_VAULT_ABI = [
  "function runPayroll(address[] employees, bytes32[] encryptedAmounts, bytes[] inputProofs) external",
];

const SEPOLIA_CHAIN_ID = 11155111n;

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const signerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY; // must be a Safe owner
  const vaultAddress = process.env.PAYROLL_VAULT_ADDRESS;
  const cUsdcAddress = process.env.CONFIDENTIAL_USDC_ADDRESS;
  const safeAddress = process.env.SAFE_ADDRESS;
  if (!rpcUrl || !signerPrivateKey || !vaultAddress || !cUsdcAddress || !safeAddress) {
    throw new Error(
      "Set SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY, PAYROLL_VAULT_ADDRESS, CONFIDENTIAL_USDC_ADDRESS and SAFE_ADDRESS in .env first."
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const ownerSigner = new ethers.Wallet(signerPrivateKey, provider);

  // Nox binds each proof to (app, owner) = the address that will call
  // Nox.fromExternal() when the proof is consumed. runPayroll() forwards the
  // proof into ConfidentialUSDC.confidentialTransferFrom(), which calls
  // fromExternal() in its own execution context — so:
  //   app   = ConfidentialUSDC (the contract making that internal call)
  //   owner = PayrollVault (msg.sender as seen by ConfidentialUSDC, since the
  //           Vault is what directly calls confidentialTransferFrom)
  // Neither matches the deployer EOA, so we bind against a minimal duck-typed
  // "signer" whose only real job is to report the Vault's address.
  const vaultOwnerClient = { getAddress: async () => vaultAddress, provider };
  const handleClient = await createEthersHandleClient(vaultOwnerClient as any);

  const employees: string[] = [];
  const encryptedAmounts: string[] = [];
  const inputProofs: string[] = [];

  for (const { employee, amountUsdc } of PAYROLL) {
    const { handle, handleProof } = await handleClient.encryptInput(amountUsdc, "uint256", cUsdcAddress as `0x${string}`);
    employees.push(employee);
    encryptedAmounts.push(handle);
    inputProofs.push(handleProof);
  }

  const vaultInterface = new ethers.Interface(PAYROLL_VAULT_ABI);
  const data = vaultInterface.encodeFunctionData("runPayroll", [employees, encryptedAmounts, inputProofs]);

  const protocolKit = await Safe.init({ provider: rpcUrl, signer: signerPrivateKey, safeAddress });
  const threshold = await protocolKit.getThreshold();

  const safeTransaction = await protocolKit.createTransaction({
    transactions: [{ to: vaultAddress, value: "0", data }],
  });
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signedSafeTransaction = await protocolKit.signTransaction(safeTransaction);

  if (threshold === 1) {
    console.log("Safe threshold is 1 — executing directly...");
    const execResult = await protocolKit.executeTransaction(signedSafeTransaction);
    console.log("Payroll tx submitted:", execResult.hash);
    await provider.waitForTransaction(execResult.hash);
    console.log(`Payroll run complete for ${employees.length} employees. Amounts stayed confidential end-to-end.`);
    return;
  }

  console.log(`Safe threshold is ${threshold} — proposing transaction for co-signers...`);
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
  console.log(`Once threshold is met, execute with: apiKit.getTransaction(safeTxHash) + protocolKit.executeTransaction(...)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
