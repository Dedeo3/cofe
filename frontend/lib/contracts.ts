export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "11155111");
export const PAYROLL_VAULT_ADDRESS = (process.env.NEXT_PUBLIC_PAYROLL_VAULT_ADDRESS ?? "") as `0x${string}`;
export const CONFIDENTIAL_USDC_ADDRESS = (process.env.NEXT_PUBLIC_CONFIDENTIAL_USDC_ADDRESS ?? "") as `0x${string}`;
export const SAFE_ADDRESS = (process.env.NEXT_PUBLIC_SAFE_ADDRESS ?? "") as `0x${string}`;

export const PAYROLL_VAULT_ABI = [
  "function runPayroll(address[] employees, bytes32[] encryptedAmounts, bytes[] inputProofs) external",
  "event PayrollRun(address indexed employee, address indexed executor)",
];

export const CONFIDENTIAL_USDC_ABI = [
  "function confidentialBalanceOf(address account) external view returns (bytes32)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];
// Note: unwrap() back to plain USDC is a two-phase async decrypt+callback flow
// (unwrap -> off-chain decryption -> finalizeUnwrap). Not wired up in v1 UI —
// see contracts/ConfidentialUSDC's ERC20ToERC7984WrapperBase for the real signature.
