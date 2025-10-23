// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../libraries/Types.sol";

contract Insurance {
    using Types for Types.Policy;

    event PolicyCreated(address indexed user, uint256 indexed productId, uint256 premiumPaid);

    function createPolicy(uint256 productId, uint256 premiumPaid) external {
        emit PolicyCreated(msg.sender, productId, premiumPaid);
    }
}
