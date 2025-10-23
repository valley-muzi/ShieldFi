// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Types.sol";

library Fees {
    /// @notice 환불 정책 파라미터
    /// @param feeBps       수수료(BPS, 1% = 100)
    /// @param linear       true면 남은기간 비례 환불, false면 전액 무환불(예시)
    /// @param minRefundBps 최소 환불 보장(BPS). 0이면 보장 없음
    struct RefundPolicy {
        uint16 feeBps;        // 0 ~ 10000
        bool   linear;        // true: 남은기간 비례, false: 무환불
        uint16 minRefundBps;  // 0 ~ 10000
    }

    uint16 internal constant BPS_DENOM = 10_000;

    /// @notice 중도해지 환불액 계산(예시 정책)
    /// @param policy    대상 폴리시 (status 등은 외부에서 체크 권장)
    /// @param nowTs     현재 타임스탬프 (block.timestamp를 외부에서 주입하면 테스트 용이)
    /// @param rp        환불 정책
    /// @return refundWei 환불액(wei)
    function refundOf(
        Types.Policy memory policy,
        uint64 nowTs,
        RefundPolicy memory rp
    ) internal pure returns (uint256 refundWei) {
        if (!rp.linear) return 0; // 무환불 정책

        if (nowTs >= policy.endDate) {
            // 만기 이후: 환불 없음
            return 0;
        }
        if (policy.premiumPaid == 0) return 0;
        if (policy.startDate >= policy.endDate) return 0;

        uint256 total = uint256(policy.endDate) - uint256(policy.startDate);
        uint256 remaining = uint256(policy.endDate) - uint256(nowTs);
        if (remaining > total) remaining = total;

        // 남은기간 비례 환불
        uint256 proportional = policy.premiumPaid * remaining / total;

        // 수수료 차감
        if (rp.feeBps > 0) {
            uint256 fee = proportional * rp.feeBps / BPS_DENOM;
            proportional -= fee;
        }

        // 최소 환불 보장 적용 (ex: 5% 이상)
        if (rp.minRefundBps > 0) {
            uint256 minRefund = policy.premiumPaid * rp.minRefundBps / BPS_DENOM;
            if (proportional < minRefund) {
                proportional = minRefund;
            }
        }

        return proportional;
    }
}
