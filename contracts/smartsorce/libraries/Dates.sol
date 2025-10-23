// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library Dates {
    /// @dev 365일을 1년으로 취급(윤년은 외부에서 정책적으로 처리 가능)
    uint256 internal constant YEAR_SECONDS = 365 days;

    function addYear(uint64 start) internal pure returns (uint64) {
        unchecked {
            return uint64(uint256(start) + YEAR_SECONDS);
        }
    }

    function isExpired(uint64 nowTs, uint64 endDate) internal pure returns (bool) {
        return nowTs >= endDate;
    }

    /// @notice 두 시각 간의 양수 차이(초)
    function diff(uint64 a, uint64 b) internal pure returns (uint256) {
        return (a >= b) ? (uint256(a) - uint256(b)) : (uint256(b) - uint256(a));
    }

    /// @notice a와 b 중 작은 값
    function min(uint64 a, uint64 b) internal pure returns (uint64) {
        return a <= b ? a : b;
    }

    /// @notice a와 b 중 큰 값
    function max(uint64 a, uint64 b) internal pure returns (uint64) {
        return a >= b ? a : b;
    }
}
