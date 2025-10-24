// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "../common/Errors.sol";
import "../common/Events.sol";

/// @title Treasury (MVP)
/// @notice 보험료 입금/환불/지급 출납 전담(ETH 전용)
contract Treasury is Ownable2Step, ReentrancyGuard, Pausable {
    constructor() Ownable(msg.sender) {}
    address public insurance; // Insurance 컨트랙트
    address public payout;    // Payout 컨트랙트

    modifier onlyInsurance() {
        if (msg.sender != insurance) revert NotAuthorized();
        _;
    }

    modifier onlyPayout() {
        if (msg.sender != payout) revert NotAuthorized();
        _;
    }

    // ===== Admin =====
    function setInsurance(address insurance_) external onlyOwner {
        if (insurance_ == address(0)) revert ZeroAddress();
        insurance = insurance_;
    }

    function setPayout(address payout_) external onlyOwner {
        if (payout_ == address(0)) revert ZeroAddress();
        payout = payout_;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ===== Flows =====

    /// @notice 보험료 입금(Insurance에서 호출). policyId는 로그용.
    function depositPremium(uint256 policyId) external payable onlyInsurance whenNotPaused {
        if (msg.value == 0) revert InvalidAmount();
        emit Events.PremiumPaid(policyId, msg.sender, msg.value);
    }

    /// @notice 확정 전 취소(쿨링오프) 환불. Insurance에서 호출.
    function refund(address to, uint256 policyId, uint256 amount)
        external
        onlyInsurance
        nonReentrant
        whenNotPaused
    {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        _safeSend(to, amount);
        emit Events.RefundIssued(policyId, to, amount);
    }

    /// @notice 승인된 청구 지급. Payout에서 호출.
    function payOut(address to, uint256 policyId, uint256 amount)
        external
        onlyPayout
        nonReentrant
        whenNotPaused
    {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        _safeSend(to, amount);
        emit Events.PayoutExecuted(policyId, to, amount);
    }

    receive() external payable {} // 잔여 ETH 수령 허용

    // ===== Internals =====
    function _safeSend(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH_SEND_FAIL");
    }
}