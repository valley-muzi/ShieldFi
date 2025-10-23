// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";


/// @title PolicyNFT
/// @notice 보험 가입 증표. Controller만 mint/burn 가능.
///         Lock 모드에서는 v5 훅(_update)에서 transfer를 차단.
contract PolicyNFT is ERC721, Ownable {
    uint256 private _tokenIdSeq;

    // 컨트롤러 권한: Insurance/Lifecycle/Payout 등
    mapping(address => bool) public controllers;

    // 토큰 잠금(해지/만기 보존 모드일 때 true)
    mapping(uint256 => bool) public locked;

    constructor(address owner_) ERC721("ShieldFi Policy", "SFP") Ownable(owner_) {}

    modifier onlyController() {
        require(controllers[msg.sender], "NOT_CONTROLLER");
        _;
    }

    function setController(address who, bool on) external onlyOwner {
        controllers[who] = on;
    }

    function mint(address to) external onlyController returns (uint256 tokenId) {
        tokenId = ++_tokenIdSeq;
        _safeMint(to, tokenId);
    }

    function burn(uint256 tokenId) external onlyController {
        _burn(tokenId);
        if (locked[tokenId]) delete locked[tokenId];
    }

    /// @dev 잠금 표시(해지/만기 보존 정책일 때)
    function lockToken(uint256 tokenId, bool on) external onlyController {
        locked[tokenId] = on;
    }

    /// @dev OZ v5에서는 전송 차단을 전송 훅으로 처리한다.
    ///      _update는 mint/transfer/burn 모두에서 호출된다.
    ///      from != 0 && to != 0  → "순수 전송"인 경우에만 잠금 검사.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        // super 호출 전에 현재 소유자(from)를 확인
        // (mint 시 from=0x0, burn 시 to=0x0 이므로 둘 다 제외)
        address currentOwner = _ownerOf(tokenId);
        bool isTransfer = (currentOwner != address(0) && to != address(0));
        if (isTransfer) {
            require(!locked[tokenId], "LOCKED");
        }
        // 상태 업데이트 수행
        return super._update(to, tokenId, auth);
    }
}
