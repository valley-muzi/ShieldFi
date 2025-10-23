// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Types} from "../libraries/Types.sol";
import {Dates} from "../libraries/Dates.sol";

interface IPolicyNFT {
    function mint(address to) external returns (uint256 tokenId);
    function burn(uint256 tokenId) external;
    function lockToken(uint256 tokenId, bool on) external;
}

contract Insurance is Ownable2Step {
    using Dates for uint64;

    // 정책 저장
    mapping(uint256 => Types.Policy) private _policies;
    uint256 public policySeq;

    address public policyNFT;  // PolicyNFT 컨트랙트 주소

    constructor(address owner_) Ownable(owner_) {}

    // --- Admin wiring ---
    function setPolicyNFT(address nft) external onlyOwner {
        policyNFT = nft;
    }

    // --- 조회 ---
    function getPolicy(uint256 policyId) external view returns (Types.Policy memory) {
        return _policies[policyId];
    }

    function ownerOfPolicy(uint256 policyId) public view returns (address) {
        return _policies[policyId].owner;
    }

    // --- 가입(초기 등록) ---
    /// @dev 실제 프리미엄 입금은 Treasury에서 처리. 여기서는 메타만 기록.
    function createPolicy(
        uint256 productId,
        Types.ProductTier tier,
        uint256 premiumPaid,
        uint256 coverageAmount
    ) external returns (uint256 policyId) {
        require(premiumPaid > 0, "PREMIUM_ZERO");
        policyId = ++policySeq;

        Types.Policy storage p = _policies[policyId];
        p.productId = productId;
        p.tier = tier;
        p.owner = msg.sender;
        p.premiumPaid = premiumPaid;
        p.coverageAmount = coverageAmount;
        p.status = Types.PolicyStatus.None;
        p.updatedAt = uint64(block.timestamp);

        emit Types.PolicyCreated(msg.sender, policyId, productId, premiumPaid);
    }

    // --- 확정 + NFT 발급 ---
    /// @notice start ~ start+1y로 유효. 상태 Active로 전환 + NFT 발급.
    function confirmPolicy(uint256 policyId, uint64 start) external onlyOwner {
        Types.Policy storage p = _policies[policyId];
        require(p.owner != address(0), "NOT_FOUND");
        require(p.status == Types.PolicyStatus.None, "INVALID_STATUS");

        p.startDate = start;
        p.endDate = Dates.addYear(start);
        p.status = Types.PolicyStatus.Active;
        p.updatedAt = uint64(block.timestamp);

        uint256 tokenId = IPolicyNFT(policyNFT).mint(p.owner);
        p.nftTokenId = tokenId;

        emit Types.PolicyConfirmed(policyId, p.startDate, p.endDate);
    }

    // --- 내부용(다른 코어가 상태 바꿀 때 쓸 수 있도록 최소 제공) ---

    function _setStatus(uint256 policyId, Types.PolicyStatus s) internal {
        Types.Policy storage p = _policies[policyId];
        require(p.owner != address(0), "NOT_FOUND");
        p.status = s;
        p.updatedAt = uint64(block.timestamp);
    }

    function setStatusCancelled(uint256 policyId) external onlyOwner {
        _setStatus(policyId, Types.PolicyStatus.Cancelled);
    }

    function setStatusExpired(uint256 policyId) external onlyOwner {
        _setStatus(policyId, Types.PolicyStatus.Expired);
    }

    function setStatusPaid(uint256 policyId) external onlyOwner {
        _setStatus(policyId, Types.PolicyStatus.Paid);
    }
}

