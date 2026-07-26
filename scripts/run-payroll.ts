import "dotenv/config";
import { ethers } from "ethers";
import { createEthersHandleClient } from "@iexec-nox/handle";

/**
 * Example payroll run: encrypts each employee's salary client-side (the
 * amounts below never appear in plaintext on-chain) and submits the batch
 * to PayrollVault.runPayroll(). Replace PAYROLL below with your real payroll
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

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const vaultAddress = process.env.PAYROLL_VAULT_ADDRESS;
  if (!rpcUrl || !privateKey || !vaultAddress) {
    throw new Error("Set SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY and PAYROLL_VAULT_ADDRESS in .env first.");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const handleClient = await createEthersHandleClient(signer);

  const employees: string[] = [];
  const encryptedAmounts: string[] = [];
  const inputProofs: string[] = [];

  for (const { employee, amountUsdc } of PAYROLL) {
    const { handle, handleProof } = await handleClient.encryptInput(amountUsdc, "uint256", vaultAddress);
    employees.push(employee);
    encryptedAmounts.push(handle);
    inputProofs.push(handleProof);
  }

  const vault = new ethers.Contract(vaultAddress, PAYROLL_VAULT_ABI, signer);
  const tx = await vault.runPayroll(employees, encryptedAmounts, inputProofs);
  console.log("Payroll tx submitted:", tx.hash);
  await tx.wait();
  console.log(`Payroll run complete for ${employees.length} employees. Amounts stayed confidential end-to-end.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
