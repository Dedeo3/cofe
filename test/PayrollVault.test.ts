import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

/**
 * Requires the Nox local stack (Docker Compose, started automatically by
 * @iexec-nox/nox-hardhat-plugin's `test` task) — see readme.md Phase 0 setup.
 */
describe("PayrollVault", () => {
  it("deploys and wires up the confidential token + vault", async () => {
    const { viem } = await hre.network.connect();
    const mockUsdc = await viem.deployContract("MockUSDC");
    const confidentialUsdc = await viem.deployContract("ConfidentialUSDC", [mockUsdc.address]);
    const [admin, treasury] = await viem.getWalletClients();

    const vault = await viem.deployContract("PayrollVault", [
      confidentialUsdc.address,
      treasury.account.address,
      admin.account.address,
    ]);

    assert.equal(await vault.read.admin(), admin.account.address);
    assert.equal(await vault.read.treasury(), treasury.account.address);
    assert.equal(
      (await vault.read.confidentialToken()).toLowerCase(),
      confidentialUsdc.address.toLowerCase(),
    );
  });

  // TODO once local Nox gateway is confirmed working end-to-end:
  // - wrap treasury's MockUSDC into cUSDC
  // - treasury.setOperator(vault, futureTimestamp)
  // - encrypt a salary amount via the Nox handle gateway and call runPayroll
  // - assert confidentialBalanceOf(employee) reflects the transfer without
  //   ever asserting on a plaintext amount pulled from chain state
});
