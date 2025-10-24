// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;
import "forge-std/Test.sol";
error ERC721NonexistentToken(uint256 tokenId);

// 심볼릭 링크 기반 임포트 (src_smart → smartsource)
import "src_smart/core/Insurance.sol";
import "src_smart/core/Treasury.sol";
import "src_smart/core/PolicyNFT.sol";
import "src_smart/core/Payout.sol";
import "src_smart/common/Errors.sol";
import "src_smart/libraries/Types.sol";

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
    function testApplyPolicy() public {
        vm.prank(alice);
        uint256 pid = insurance.applyPolicy{value: 1 ether}(1, 5 ether);

        Policy memory p = insurance.getPolicy(pid);
        assertEq(p.id, pid);
        assertEq(p.holder, alice);
        assertEq(p.productId, 1);
        assertEq(p.premiumPaid, 1 ether);
        assertEq(p.coverageAmount, 5 ether);
        assertEq(uint(p.status), uint(PolicyStatus.Pending));
        assertEq(address(treasury).balance, 1 ether);
    }

    // --- 확정: NFT 민팅 및 상태 전이 ---
    function testActivateNft() public {
        vm.prank(bob);
        uint256 pid = insurance.applyPolicy{value: 1 ether}(2, 3 ether);
        insurance.activate(pid);

        Policy memory p = insurance.getPolicy(pid);
        assertEq(uint(p.status), uint(PolicyStatus.Active));
        assertGt(p.tokenId, 0);
        assertEq(policyNFT.ownerOf(p.tokenId), bob);
    }

    // --- 확정 전 취소: 전액 환불, 상태 Cancelled ---
    function testCancelRefund() public {
        vm.prank(alice);
        uint256 pid = insurance.applyPolicy{value: 2 ether}(3, 4 ether);
        assertEq(address(treasury).balance, 2 ether);

        vm.prank(alice);
        insurance.cancelBeforeActivate(pid);

        Policy memory p = insurance.getPolicy(pid);
        assertEq(uint(p.status), uint(PolicyStatus.Cancelled));
        assertEq(address(treasury).balance, 0);

        vm.expectRevert(NotPending.selector);
        insurance.activate(pid);
    }

    // --- 확정 후 취소 시도: 실패해야 함 ---
    function testCancelRevert() public {
        vm.prank(bob);
        uint256 pid = insurance.applyPolicy{value: 1 ether}(4, 2 ether);
        insurance.activate(pid);

        vm.prank(bob);
        vm.expectRevert(NotPending.selector);
        insurance.cancelBeforeActivate(pid);
    }

    // --- 지급 및 종결 ---
    function testPayoutBurn() public {
        vm.prank(carol);
        uint256 pid = insurance.applyPolicy{value: 2 ether}(5, 5 ether);
        insurance.activate(pid);
        Policy memory p1 = insurance.getPolicy(pid);
        assertEq(uint(p1.status), uint(PolicyStatus.Active));
        uint256 tokenId = p1.tokenId;
        assertGt(tokenId, 0);

        payout.approveAndPay(pid, carol, 1 ether);
        assertEq(address(treasury).balance, 1 ether);

        insurance.finalizePaid(pid);
        Policy memory p2 = insurance.getPolicy(pid);
        assertEq(uint(p2.status), uint(PolicyStatus.Paid));

        vm.expectRevert(abi.encodeWithSelector(ERC721NonexistentToken.selector, tokenId));
        policyNFT.ownerOf(tokenId);
    }
}
