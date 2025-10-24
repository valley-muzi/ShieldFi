// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Types {
    enum PolicyStatus { None, Active, Claimed, Paid, Cancelled }

    struct Policy {
        address owner;
        uint256 productId;
        uint256 premiumPaid;
        PolicyStatus status;
    }
}
