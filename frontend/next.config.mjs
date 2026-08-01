import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Repo also has package-lock.json files at the root (Hardhat/scripts) and
  // in landingpage/ — pin the root explicitly so Next.js doesn't guess wrong.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
