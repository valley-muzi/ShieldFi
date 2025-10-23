// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Types {
    // 보험 상태
    enum PolicyStatus { None, Active, Claimed, Approved, Paid, Cancelled, Expired }

    // 상품 등급
    enum ProductTier { Basic, Standard, Premium }

    // 중도해지/만기 시 NFT 정책
    enum NFTModeOnCancel { Burn, Lock }
    enum NFTModeOnExpire { Burn, Lock }

    // 가입(정책) 레코드
    struct Policy {
        uint256 productId;
        ProductTier tier;
        address owner;
        uint256 premiumPaid;       // 납부 보험료(wei)
        uint256 coverageAmount;    // 보장 상한(wei)
        PolicyStatus status;
        uint64  startDate;         // 가입 효력 시작 (UTC seconds)
        uint64  endDate;           // 만기 (start + 365 days)
        uint64  updatedAt;         // 마지막 갱신/변경 시각
        uint256 nftTokenId;        // PolicyNFT tokenId
    }

    // ========== 공통 에러 ==========
    error NotPolicyOwner();
    error InvalidStatus();
    error AlreadyExpired();
    error NotActive();
    error RefundNotAllowed();
    error ZeroAmount();
    error Unauthorized();
    error InsufficientTreasury();

    // ========== 공통 이벤트 ==========
    event PolicyCreated(address indexed user, uint256 indexed policyId, uint256 productId, uint256 premiumPaid);
    event PolicyConfirmed(uint256 indexed policyId, uint64 startDate, uint64 endDate);
    event PolicyClaimed(uint256 indexed policyId, bytes32 claimId);
    event ClaimApproved(uint256 indexed policyId, uint256 payoutAmount);
    event PayoutExecuted(uint256 indexed policyId, uint256 amount, address to);

    // 해지/만기/갱신 관련
    event PolicyCancelled(uint256 indexed policyId, uint256 refundAmount);
    event PolicyExpired(uint256 indexed policyId);
    event PolicyRenewed(uint256 indexed policyId, uint64 newEndDate);
}
