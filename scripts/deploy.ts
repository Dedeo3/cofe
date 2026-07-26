import "dotenv/config";
import hre from "hardhat";

/**
 * Deploys the payroll stack:
 *  1. MockUSDC (only if USDC_ADDRESS is not set in .env)
 *  2. ConfidentialUSDC — ERC-7984 wrapper around the stablecoin
 *  3. PayrollVault — confidential payroll executor, authorized as an
 *     operator on the Safe's confidential balance (done separately, from
 *     the Safe itself, once deployed — see readme.md).
 */
async function main() {
  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();
  const safeAddress = process.env.SAFE_ADDRESS;
  if (!safeAddress) {
    throw new Error("Set SAFE_ADDRESS in .env before deploying (the company treasury Safe).");
  }

  let usdcAddress = process.env.USDC_ADDRESS;
  if (!usdcAddress) {
    console.log("USDC_ADDRESS not set — deploying MockUSDC for testing...");
    const mockUsdc = await viem.deployContract("MockUSDC");
    usdcAddress = mockUsdc.address;
    console.log("MockUSDC deployed at:", usdcAddress);
  }

  const confidentialUsdc = await viem.deployContract("ConfidentialUSDC", [usdcAddress]);
  console.log("ConfidentialUSDC (cUSDC) deployed at:", confidentialUsdc.address);

  const payrollVault = await viem.deployContract("PayrollVault", [
    confidentialUsdc.address,
    safeAddress,
    deployer.account.address, // payroll admin — change with setAdmin() if needed
  ]);
  console.log("PayrollVault deployed at:", payrollVault.address);

  console.log("\nNext steps (run from the Safe itself, e.g. via Safe{Wallet} UI or Safe SDK):");
  console.log(`  1. USDC.approve(${confidentialUsdc.address}, <total payroll amount>)`);
  console.log(`  2. ConfidentialUSDC.wrap(${safeAddress}, <total payroll amount>)`);
  console.log(`  3. ConfidentialUSDC.setOperator(${payrollVault.address}, <expiry timestamp>)`);
  console.log("\nThen fill CONFIDENTIAL_USDC_ADDRESS and PAYROLL_VAULT_ADDRESS in .env.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
