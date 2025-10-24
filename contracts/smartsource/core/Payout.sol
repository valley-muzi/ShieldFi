// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "../common/Errors.sol";
import "../common/Events.sol";

interface ITreasury {
    function payOut(address to, uint256 policyId, uint256 amount) external;
}

/// @title Payout (MVP)
/// @notice 심사/승인 권한은 간단히 owner로 한정(AccessControl 생략)
contract Payout is Ownable2Step, ReentrancyGuard, Pausable {
    /// @dev Treasury 컨트랙트 주소 보관
    ITreasury public treasury; // ← 추가

    constructor(address treasury_) Ownable(msg.sender) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = ITreasury(treasury_);
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = ITreasury(treasury_);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice (MVP) owner가 승인과 동시에 지급 실행
    function approveAndPay(uint256 policyId, address beneficiary, uint256 amount)
        external
        onlyOwner
        nonReentrant
        whenNotPaused
    {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        emit Events.ClaimApproved(policyId, beneficiary, amount);
        treasury.payOut(beneficiary, policyId, amount);
        // 실제 PayoutExecuted 이벤트는 Treasury가 emit
    }
}