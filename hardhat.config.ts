import { configVariable, defineConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import noxPlugin from "@iexec-nox/nox-hardhat-plugin";
import "dotenv/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, noxPlugin],
  solidity: "0.8.35",
  networks: {
    // Local Nox stack (KMS/gateway/etc via Docker Compose, spun up by
    // @iexec-nox/nox-hardhat-plugin). Requires Docker running.
    default: {
      type: "edr-simulated",
      chainType: "op",
      allowUnlimitedContractSize: true,
    },
    // Required deployment target for the hackathon submission.
    // configVariable() only resolves (and errors if missing) when this
    // network is actually selected — so compiling/local-testing works
    // fine even with an empty .env.
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },
});
