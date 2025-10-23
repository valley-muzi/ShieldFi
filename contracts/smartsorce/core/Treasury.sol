// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable2Step} from "openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";


/// @notice 보험료 보관 금고. 환불/지급 출구는 컨트롤러만 허용.
contract Treasury is Ownable2Step {
    mapping(address => bool) public controllers; // Lifecycle, Payout 등

    constructor(address owner_) Ownable(owner_) {}

    receive() external payable {}
    function deposit() external payable {}

    modifier onlyController() {
        require(controllers[msg.sender], "NOT_CONTROLLER");
        _;
    }

    function setController(address who, bool on) external onlyOwner {
        controllers[who] = on;
    }

    // Lifecycle용 환불
    function refund(address to, uint256 amount) external onlyController {
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "REFUND_FAIL");
    }

    // Payout용 지급
    function payout(address to, uint256 amount) external onlyController {
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "PAYOUT_FAIL");
    }
}
