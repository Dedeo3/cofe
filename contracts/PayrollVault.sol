// SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {IERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/interfaces/IERC7984.sol";
import {externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

/// @notice Executes confidential payroll batches against a company's ERC-7984
/// confidential balance without ever moving custody out of the Safe (`treasury`).
/// The Safe must first call `confidentialToken.setOperator(vault, until)` so this
/// contract is allowed to pull from the Safe's confidential balance.
contract PayrollVault {
    IERC7984 public immutable confidentialToken;
    address public immutable treasury;
    address public admin;

    event PayrollRun(address indexed employee, address indexed executor);
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    error NotAdmin();
    error LengthMismatch();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor(address confidentialToken_, address treasury_, address admin_) {
        confidentialToken = IERC7984(confidentialToken_);
        treasury = treasury_;
        admin = admin_;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice Pays a batch of employees confidentially. Individual amounts are
    /// never exposed on-chain — only this event + a confidential transfer per
    /// employee are visible.
    /// @param employees Recipient addresses.
    /// @param encryptedAmounts Per-employee encrypted salary handle, produced
    /// off-chain via the Nox handle SDK. Each proof must be bound to
    /// (app = confidentialToken address, owner = this vault's address), since
    /// that's the (msg.sender, contract) pair active when confidentialToken
    /// consumes the proof inside confidentialTransferFrom().
    /// @param inputProofs Matching proof for each encrypted amount.
    function runPayroll(
        address[] calldata employees,
        externalEuint256[] calldata encryptedAmounts,
        bytes[] calldata inputProofs
    ) external onlyAdmin {
        if (employees.length != encryptedAmounts.length || employees.length != inputProofs.length) {
            revert LengthMismatch();
        }
        for (uint256 i = 0; i < employees.length; i++) {
            confidentialToken.confidentialTransferFrom(treasury, employees[i], encryptedAmounts[i], inputProofs[i]);
            emit PayrollRun(employees[i], msg.sender);
        }
    }
}
