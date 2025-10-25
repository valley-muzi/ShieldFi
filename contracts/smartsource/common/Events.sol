// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Policy } from "../libraries/Types.sol";

/// @title Project-wide events (MVP)
library Events {
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed holder,
        uint256 indexed productId,
        uint256 premiumPaid,
        uint256 coverageAmount
    );

    event PolicyActivated(
        uint256 indexed policyId,
        uint256 tokenId,
        uint256 activatedAt
    );

    // 쿨링오프: 확정 전 취소
    event PolicyCancelledBeforeActivate(
        uint256 indexed policyId,
        address indexed holder,
        uint256 refundedAmount
    );

    event PremiumPaid(
        uint256 indexed policyId,
        address indexed payer,
        uint256 amount
    );

    event ClaimApproved(
        uint256 indexed policyId,
        address indexed beneficiary,
        uint256 amount
    );

    event PayoutExecuted(
        uint256 indexed policyId,
        address indexed to,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed policyId,
        address indexed to,
        uint256 amount
    );
}
