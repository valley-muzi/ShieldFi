// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Shared types for ShieldFi insurance contracts (MVP)
/// @notice Cooling-off(확정 전 전액 환불)만 지원. 갱신 없음.
enum PolicyStatus {
    Pending,   // 가입 신청 후 확정 전 (쿨링오프 허용)
    Active,    // 확정 완료 (쿨링오프 불가)
    Paid,      // 보험금 지급 완료 (NFT 소각)
    // 아래 둘은 추후 확장을 위한 예약 상태 (MVP에서는 미사용)
    Cancelled, // 예약
    Expired    // 예약
}

struct Policy {
    uint256 id;             // 내부 policyId
    address holder;         // 가입자
    uint256 productId;      // 상품 식별자(프론트/백엔드 연동용)
    uint256 premiumPaid;    // 납부 보험료 (wei)
    uint256 coverageAmount; // 보장 금액 (wei) - 승인 시 지급 상한
    uint256 createdAt;      // 생성 시각 (block.timestamp)
    uint256 activatedAt;    // 확정 시각(미확정이면 0)
    uint256 tokenId;        // PolicyNFT tokenId (확정 시 민팅)
    PolicyStatus status;    // 상태머신
}