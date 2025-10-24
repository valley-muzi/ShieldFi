// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";

import "../../smartsource/core/Insurance.sol";
import "../../smartsource/core/Treasury.sol";
import "../../smartsource/core/PolicyNFT.sol";
import "../../smartsource/core/Payout.sol";
import "../../smartsource/common/Errors.sol";
import "../../smartsource/libraries/Types.sol";

contract InsuranceTest is Test {
    // Actors
    address owner = address(this);   // 배포/운영자
    address alice;
    address bob;
    address carol;

    // Contracts
    Treasury treasury;
    PolicyNFT policyNFT;
    Payout payout;
    Insurance insurance;

    function setUp() public {
        // 주소 생성 (forge-std 헬퍼)
        alice = makeAddr("alice");
        bob   = makeAddr("bob");
        carol = makeAddr("carol");

        // 1) 배포
        treasury  = new Treasury();
        policyNFT = new PolicyNFT("ShieldFi Policy", "SFP");
        insurance = new Insurance(address(treasury), address(policyNFT));
        payout    = new Payout(address(treasury));

        // 2) 배선
        treasury.setInsurance(address(insurance));
        treasury.setPayout(address(payout));
        policyNFT.setMinter(address(insurance)); // Insurance가 민팅/소각 수행

        // 잔액 준비
        vm.deal(alice, 10 ether);
        vm.deal(bob,   10 ether);
        vm.deal(carol, 10 ether);
    }

    // --- 가입: 프리미엄 입금 및 저장 검증 ---
    function testApplyStoresPolicyAndDepositsPremium() public {
        // when: alice가 가입 (1 ETH)
        vm.prank(alice);
        uint256 pid = insurance.applyPolicy{value: 1 ether}(1 /*productId*/, 5 ether /*coverage*/);

        // then: policy 저장 확인
        Policy memory p = insurance.getPolicy(pid);
        assertEq(p.id, pid);
        assertEq(p.holder, alice);
        assertEq(p.productId, 1);
        assertEq(p.premiumPaid, 1 ether);
        assertEq(p.coverageAmount, 5 ether);
        assertEq(uint(p.status), uint(PolicyStatus.Pending));

        // and: Treasury 잔액이 1 ETH 증가
        assertEq(address(treasury).balance, 1 ether);
    }

    // --- 확정: NFT 민팅 및 상태 전이 ---
    function testActivateMintsNftAndSetsActive() public {
        // given: bob이 가입
        vm.prank(bob);
        uint256 pid = insurance.applyPolicy{value: 1 ether}(2, 3 ether);

        // when: owner가 확정
        insurance.activate(pid);

        // then: 상태 Active 및 tokenId 세팅 확인
        Policy memory p = insurance.getPolicy(pid);
        assertEq(uint(p.status), uint(PolicyStatus.Active));
        assertGt(p.tokenId, 0);

        // and: NFT 소유자는 bob
        assertEq(policyNFT.ownerOf(p.tokenId), bob);
    }

    // --- 확정 전 취소: 전액 환불, 상태 Cancelled ---
    function testCancelBeforeActivateRefundsFullPremium() public {
        // given: alice가 2 ETH로 가입
        vm.prank(alice);
        uint256 pid = insurance.applyPolicy{value: 2 ether}(3, 4 ether);
        assertEq(address(treasury).balance, 2 ether);

        // when: alice가 확정 전 취소
        vm.prank(alice);
        insurance.cancelBeforeActivate(pid);

        // then: 상태 Cancelled, Treasury 잔액은 0
        Policy memory p = insurance.getPolicy(pid);
        assertEq(uint(p.status), uint(PolicyStatus.Cancelled));
        assertEq(address(treasury).balance, 0);

        // and: 이후 확정 시도는 실패
        vm.expectRevert(NotPending.selector);
        insurance.activate(pid);
    }

    // --- 확정 후 취소 시도: 실패해야 함 ---
    function testCancelAfterActivateReverts() public {
        // given: bob 가입 후 확정
        vm.prank(bob);
        uint256 pid = insurance.applyPolicy{value: 1 ether}(4, 2 ether);
        insurance.activate(pid);

        // when/then: bob이 확정 후 취소 시도 → 실패
        vm.prank(bob);
        vm.expectRevert(NotPending.selector);
        insurance.cancelBeforeActivate(pid);
    }

    // --- 지급 및 종결: Payout->Treasury 지급, 보험사 finalizePaid로 NFT 소각 ---
    function testPayoutThenFinalizePaidBurnsNft() public {
        // given: carol이 2 ETH로 가입 후 확정
        vm.prank(carol);
        uint256 pid = insurance.applyPolicy{value: 2 ether}(5, 5 ether);
        insurance.activate(pid);
        Policy memory p1 = insurance.getPolicy(pid);
        assertEq(uint(p1.status), uint(PolicyStatus.Active));
        uint256 tokenId = p1.tokenId;
        assertGt(tokenId, 0);
        // treasury 잔액: 2 ETH

        // when: owner가 청구 승인 및 1 ETH 지급
        payout.approveAndPay(pid, carol, 1 ether);

        // then: Treasury 잔액은 1 ETH 남음
        assertEq(address(treasury).balance, 1 ether);

        // and: 보험사가 종결(finalizePaid) → NFT 소각 + 상태 Paid
        insurance.finalizePaid(pid);

        Policy memory p2 = insurance.getPolicy(pid);
        assertEq(uint(p2.status), uint(PolicyStatus.Paid));

        // NFT 소유 조회는 revert(소각됨)
        vm.expectRevert(bytes("ERC721: invalid token ID"));
        policyNFT.ownerOf(tokenId);
    }
}