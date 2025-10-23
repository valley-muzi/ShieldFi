// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Types} from "../libraries/Types.sol";

interface IPolicyNFT3 {
    function burn(uint256 tokenId) external;
}

interface IInsurance2 {
    function getPolicy(uint256 policyId) external view returns (Types.Policy memory);
    function setStatusPaid(uint256 policyId) external;
}

interface ITreasury2 {
    function payout(address to, uint256 amount) external;
}

contract Payout is Ownable2Step {
    address public insurance;
    address public policyNFT;
    address public treasury;

    constructor(address owner_) Ownable(owner_) {}

    function setAddresses(address _insurance, address _policyNFT, address _treasury) external onlyOwner {
        insurance = _insurance;
        policyNFT = _policyNFT;
        treasury = _treasury;
    }

    /// @notice 외부(오라클/검증자) 승인 후 호출된다고 가정하는 골격
    function executePayout(uint256 policyId, address to, uint256 amount) external onlyOwner {
        Types.Policy memory p = IInsurance2(insurance).getPolicy(policyId);
        require(p.status == Types.PolicyStatus.Approved || p.status == Types.PolicyStatus.Claimed, "BAD_STATUS");

        ITreasury2(treasury).payout(to, amount);
        IInsurance2(insurance).setStatusPaid(policyId);

        // 지급 완료 후 NFT 소각(정책상 확정)
        if (p.nftTokenId != 0) {
            IPolicyNFT3(policyNFT).burn(p.nftTokenId);
        }

        emit Types.PayoutExecuted(policyId, amount, to);
    }
}
