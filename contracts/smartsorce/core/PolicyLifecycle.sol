// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Types} from "../libraries/Types.sol";
import {Dates} from "../libraries/Dates.sol";
import {Fees} from "../libraries/Fees.sol";

interface IPolicyNFT2 {
    function burn(uint256 tokenId) external;
    function lockToken(uint256 tokenId, bool on) external;
}

interface IInsurance {
    function getPolicy(uint256 policyId) external view returns (Types.Policy memory);
    function ownerOfPolicy(uint256 policyId) external view returns (address);
    function setStatusCancelled(uint256 policyId) external;
    function setStatusExpired(uint256 policyId) external;
}

interface ITreasury {
    function refund(address to, uint256 amount) external;
}

contract PolicyLifecycle is Ownable2Step {
    using Dates for uint64;

    address public insurance;
    address public policyNFT;
    address public treasury;

    // 정책: 해지/만기 시 NFT를 소각할지, 잠글지
    Types.NFTModeOnCancel public cancelMode = Types.NFTModeOnCancel.Burn;
    Types.NFTModeOnExpire public expireMode = Types.NFTModeOnExpire.Burn;

    // 환불 전략(예시)
    Fees.RefundPolicy public refundPolicy = Fees.RefundPolicy({
        feeBps: 1000,         // 10% 수수료
        linear: true,         // 남은기간 비례
        minRefundBps: 500     // 최소 5%
    });

    constructor(address owner_) Ownable(owner_) {}

    // wiring
    function setAddresses(address _insurance, address _policyNFT, address _treasury) external onlyOwner {
        insurance = _insurance;
        policyNFT = _policyNFT;
        treasury = _treasury;
    }

    function setCancelMode(Types.NFTModeOnCancel m) external onlyOwner { cancelMode = m; }
    function setExpireMode(Types.NFTModeOnExpire m) external onlyOwner { expireMode = m; }
    function setRefundPolicy(Fees.RefundPolicy calldata rp) external onlyOwner { refundPolicy = rp; }

    /// @notice 가입자 본인이 중도해지
    function cancelPolicy(uint256 policyId) external {
        Types.Policy memory p = IInsurance(insurance).getPolicy(policyId);
        if (p.status != Types.PolicyStatus.Active) revert Types.NotActive();
        if (IInsurance(insurance).ownerOfPolicy(policyId) != msg.sender) revert Types.NotPolicyOwner();

        uint256 refundWei = Fees.refundOf(p, uint64(block.timestamp), refundPolicy);
        if (refundWei == 0) revert Types.RefundNotAllowed();

        // 상태 전이 + 환불 + NFT 처리
        IInsurance(insurance).setStatusCancelled(policyId);
        ITreasury(treasury).refund(p.owner, refundWei);
        _handleNftOnCancel(p.nftTokenId);

        emit Types.PolicyCancelled(policyId, refundWei);
    }

    /// @notice 만기 처리(아무나 호출 가능) — 내부에서 만기 여부 검증
    function expirePolicy(uint256 policyId) external {
        Types.Policy memory p = IInsurance(insurance).getPolicy(policyId);
        if (p.status != Types.PolicyStatus.Active) revert Types.NotActive();
        if (!Dates.isExpired(uint64(block.timestamp), p.endDate)) revert Types.InvalidStatus();

        IInsurance(insurance).setStatusExpired(policyId);
        _handleNftOnExpire(p.nftTokenId);

        emit Types.PolicyExpired(policyId);
    }

    function _handleNftOnCancel(uint256 tokenId) internal {
        if (cancelMode == Types.NFTModeOnCancel.Burn) {
            IPolicyNFT2(policyNFT).burn(tokenId);
        } else {
            IPolicyNFT2(policyNFT).lockToken(tokenId, true);
        }
    }

    function _handleNftOnExpire(uint256 tokenId) internal {
        if (expireMode == Types.NFTModeOnExpire.Burn) {
            IPolicyNFT2(policyNFT).burn(tokenId);
        } else {
            IPolicyNFT2(policyNFT).lockToken(tokenId, true);
        }
    }
}
