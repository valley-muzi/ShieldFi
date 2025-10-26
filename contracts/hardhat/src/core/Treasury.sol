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

    // ===== 회계(가시성 강화) =====
    uint256 public totalPremium;                    // 총 유입 보험료
    mapping(uint256 => uint256) public policyPremium; // 정책별 납부 총액

    // ===== 커스텀 에러(이 컨트랙트 한정) =====
    error InsufficientBalance(uint256 requested, uint256 available);

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

    /// @notice 보험료 입금(Insurance에서 호출). policyId는 로그/회계용.
    function depositPremium(uint256 policyId)
        external
        payable
        onlyInsurance
        whenNotPaused
    {
        if (msg.value == 0) revert InvalidAmount();

        // 회계 반영
        totalPremium += msg.value;
        policyPremium[policyId] += msg.value;

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

        // 회계 상 원천 납부액 내에서만 환불 허용(이중/과다 환불 방지)
        uint256 paid = policyPremium[policyId];
        if (amount > paid) revert InvalidAmount(); // 요청액이 납부액 초과

        // 금고 잔액 확인
        uint256 bal = address(this).balance;
        if (amount > bal) revert InsufficientBalance(amount, bal);

        // 회계 차감 후 전송
        policyPremium[policyId] = paid - amount;
        totalPremium -= amount;

        _safeSend(to, amount);
        emit Events.RefundIssued(policyId, to, amount);
    }

    /// @notice 승인된 청구 지급. Payout에서 호출.
    /// @dev 풀 개념: 정책별로 차감하지 않고 금고 전체 잔액에서 지급
    function payOut(address to, uint256 policyId, uint256 amount)
        external
        onlyPayout
        nonReentrant
        whenNotPaused
    {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        uint256 bal = address(this).balance;
        if (amount > bal) revert InsufficientBalance(amount, bal);

        _safeSend(to, amount);
        emit Events.PayoutExecuted(policyId, to, amount);
    }

    receive() external payable {} // 잔여 ETH 수령 허용

    // ===== Internals =====
    function _safeSend(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH_SEND_FAIL");
    }

    // ===== View helpers =====
    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
