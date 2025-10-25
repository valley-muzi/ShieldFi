// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "../libraries/Types.sol";
import "../common/Errors.sol";
import "../common/Events.sol";

interface ITreasury_DepositRefund {
    function depositPremium(uint256 policyId) external payable;
    function refund(address to, uint256 policyId, uint256 amount) external;
}

interface IPolicyNFT_MintBurn {
    function mintFor(address to, uint256 policyId) external returns (uint256 tokenId);
    function burn(uint256 tokenId) external;
}

/// @title Insurance (MVP)
/// @notice 가입/확정/조회 및 확정 전 전액 환불(쿨링오프)만 지원.
///         확정(Active) 이후 취소·환불·갱신 기능은 미지원.
contract Insurance is Ownable2Step, Pausable, ReentrancyGuard {
    ITreasury_DepositRefund public treasury;
    IPolicyNFT_MintBurn public policyNFT;

    uint256 public nextPolicyId;
    mapping(uint256 => Policy) private _policies;

    // ===== 구성요소 주입 =====
    constructor(address treasury_, address policyNFT_) Ownable(msg.sender) {
        if (treasury_ == address(0) || policyNFT_ == address(0)) revert ZeroAddress();
        treasury = ITreasury_DepositRefund(treasury_);
        policyNFT = IPolicyNFT_MintBurn(policyNFT_);
        nextPolicyId = 1;
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = ITreasury_DepositRefund(treasury_);
    }

    function setPolicyNFT(address policyNFT_) external onlyOwner {
        if (policyNFT_ == address(0)) revert ZeroAddress();
        policyNFT = IPolicyNFT_MintBurn(policyNFT_);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ===== 가입(프리미엄 납부 동시) =====
    /// @notice 가입 신청 접수. msg.value 전체가 premium으로 납부되며 Treasury에 즉시 입금됨.
    /// @param productId 프론트/백엔드 식별용 상품 ID
    /// @param coverageAmount 보장 금액(승인 시 상한)
    /// @return policyId 신규 정책 ID
    function applyPolicy(uint256 productId, uint256 coverageAmount)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256 policyId)
    {
        if (msg.value == 0) revert InvalidAmount();
        if (coverageAmount == 0) revert InvalidAmount();

        policyId = nextPolicyId++;
        Policy storage p = _policies[policyId];
        p.id = policyId;
        p.holder = msg.sender;
        p.productId = productId;
        p.premiumPaid = msg.value;
        p.coverageAmount = coverageAmount;
        p.createdAt = block.timestamp;
        p.status = PolicyStatus.Pending;

        treasury.depositPremium{value: msg.value}(policyId);

        emit Events.PolicyCreated(policyId, msg.sender, productId, msg.value, coverageAmount);
    }

    // ===== 확정(민팅 동반) =====
    /// @notice 보험사(오너)가 확정 처리. 이때 NFT 발급.
    function activate(uint256 policyId) external onlyOwner whenNotPaused nonReentrant {
        Policy storage p = _policies[policyId];
        if (p.holder == address(0)) revert ZeroAddress();
        if (p.status == PolicyStatus.Active) revert AlreadyActive();
        if (p.status == PolicyStatus.Paid) revert AlreadyPaid();
        if (p.status != PolicyStatus.Pending) revert NotPending();

        uint256 tokenId = policyNFT.mintFor(p.holder, policyId);
        p.status = PolicyStatus.Active;
        p.activatedAt = block.timestamp;
        p.tokenId = tokenId;

        emit Events.PolicyActivated(policyId, tokenId, p.activatedAt);
    }

    // ===== 확정 전 전액 환불(쿨링오프) =====
    /// @notice 가입자가 확정 전에 취소하면 전액 환불. 이후 재활성화 불가.
    function cancelBeforeActivate(uint256 policyId) external whenNotPaused nonReentrant {
        Policy storage p = _policies[policyId];
        if (p.holder == address(0)) revert ZeroAddress();
        if (msg.sender != p.holder) revert NotAuthorized();
        if (p.status != PolicyStatus.Pending) revert NotPending();

        uint256 amount = p.premiumPaid;
        if (amount == 0) revert InvalidAmount();

        p.status = PolicyStatus.Cancelled;  // 예약 상태 사용
        p.premiumPaid = 0;                 // 이중 환불 방지

        treasury.refund(p.holder, policyId, amount);
        emit Events.PolicyCancelledBeforeActivate(policyId, p.holder, amount);
    }

    // ===== 지급 완료 후 후처리(NFT 소각 등) =====
    /// @notice 지급 플로우 완료 후 오너가 호출해 NFT를 소각하고 상태를 Paid로 종결
    ///         실제 지급은 Payout->Treasury가 수행. 여기선 상태/토큰 정리만 담당.
    function finalizePaid(uint256 policyId) external onlyOwner whenNotPaused nonReentrant {
        Policy storage p = _policies[policyId];
        if (p.holder == address(0)) revert ZeroAddress();
        if (p.status != PolicyStatus.Active) revert NotActive();
        if (p.status == PolicyStatus.Paid) revert AlreadyPaid();
        if (p.tokenId == 0) revert TokenNotSet();

        policyNFT.burn(p.tokenId);
        p.status = PolicyStatus.Paid;
    }

    // ===== 조회기 =====
    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        return _policies[policyId];
    }
}
