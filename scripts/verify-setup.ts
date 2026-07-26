import "dotenv/config";
import hre from "hardhat";

/**
 * Sanity-checks the Safe → cUSDC → PayrollVault wiring after the Safe has
 * run approve/wrap/setOperator. Only checks values that are plaintext by
 * design (underlying ERC20 balance, operator flag) — confidential balances
 * are encrypted handles and can't be read as plain numbers here.
 */
async function main() {
  const { viem } = await hre.network.connect();
  const usdcAddress = process.env.USDC_ADDRESS as `0x${string}`;
  const cUsdcAddress = process.env.CONFIDENTIAL_USDC_ADDRESS as `0x${string}`;
  const vaultAddress = process.env.PAYROLL_VAULT_ADDRESS as `0x${string}`;
  const safeAddress = process.env.SAFE_ADDRESS as `0x${string}`;

  const usdc = await viem.getContractAt("MockUSDC", usdcAddress);
  // ConfidentialUSDC implements IERC7984, so its own artifact's ABI covers
  // isOperator/confidentialBalanceOf/etc — no separate interface artifact needed.
  const cUsdc = await viem.getContractAt("ConfidentialUSDC", cUsdcAddress);

  const wrapperUnderlyingBalance = await usdc.read.balanceOf([cUsdcAddress]);
  console.log("cUSDC contract's underlying mUSDC balance (should be 100000000000 after wrap):", wrapperUnderlyingBalance.toString());

  const isOperator = await cUsdc.read.isOperator([safeAddress, vaultAddress]);
  console.log("Is PayrollVault an operator for the Safe on cUSDC?", isOperator);

  const safeUnderlyingBalance = await usdc.read.balanceOf([safeAddress]);
  console.log("Safe's remaining plain mUSDC balance (should be 0, all wrapped):", safeUnderlyingBalance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
