// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC20ToERC7984Wrapper} from
    "@iexec-nox/nox-confidential-contracts/contracts/token/extensions/ERC20ToERC7984Wrapper.sol";

/// @notice Confidential wrapper around the payroll stablecoin (mUSDC on testnet,
/// USDC in production). The company Safe wraps its public USDC into cUSDC so
/// balances/transfers become confidential (ERC-7984) while everything else
/// about the Safe stays untouched.
contract ConfidentialUSDC is ERC20ToERC7984Wrapper {
    constructor(IERC20 underlying)
        ERC20ToERC7984Wrapper("Confidential USD Coin", "cUSDC", "", underlying)
    {}
}
