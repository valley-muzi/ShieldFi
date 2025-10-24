// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

error NotOwner();
error NotAuthorized();
error ZeroAddress();
error InvalidAmount();
error NotImplemented();

error NotPending();     // Pending이 아니라서 쿨링오프 불가
error AlreadyActive();  // 이미 Active 상태
error NotActive();      // Active가 아니라서 실행 불가
error AlreadyPaid();    // 이미 지급 완료
error TokenNotSet();    // tokenId가 설정되지 않음(NFT 관련)
