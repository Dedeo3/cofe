import "dotenv/config";
import hre from "hardhat";

/**
 * Mints test mUSDC to the company Safe so it has something to wrap into
 * cUSDC. Only works against MockUSDC (has an open, unrestricted `mint`) —
 * not applicable if USDC_ADDRESS points to a real stablecoin.
 */
async function main() {
  const { viem } = await hre.network.connect();
  const usdcAddress = process.env.USDC_ADDRESS;
  const safeAddress = process.env.SAFE_ADDRESS;
  if (!usdcAddress || !safeAddress) {
    throw new Error("Set USDC_ADDRESS and SAFE_ADDRESS in .env first.");
  }

  const amount = 100_000_000_000n; // 100,000.00 mUSDC (6 decimals)
  const mockUsdc = await viem.getContractAt("MockUSDC", usdcAddress as `0x${string}`);
  const tx = await mockUsdc.write.mint([safeAddress as `0x${string}`, amount]);
  console.log("Mint tx:", tx);
  console.log(`Minted ${amount} (raw units) mUSDC to Safe ${safeAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
