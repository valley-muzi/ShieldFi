// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "../common/Errors.sol";

/// @title PolicyNFT (MVP)
/// @notice 가입 확정 시 Insurance가 민팅, 지급(Paid) 시 소각
contract PolicyNFT is ERC721, Ownable2Step {
    using Strings for uint256;

    uint256 private _nextTokenId;
    string private _baseTokenURI;

    // policyId -> tokenId (확정 시 기록)
    mapping(uint256 => uint256) public policyToken;

    // Insurance 권한 위임용
    address public minter;

    // 배포자가 기본 오너가 되도록 지정 (Ownable2Step -> Ownable(msg.sender))
    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {}

    // ── Admin ──────────────────────────────────────────────────────────────
    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function setMinter(address minter_) external onlyOwner {
        if (minter_ == address(0)) revert ZeroAddress();
        minter = minter_;
    }

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotAuthorized();
        _;
    }

    // ── Flows ──────────────────────────────────────────────────────────────

    /// @notice 가입 확정 시 Insurance가 호출해서 NFT 발급
    function mintFor(address to, uint256 policyId) external onlyMinter returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (policyToken[policyId] != 0) revert AlreadyPaid(); // 이미 발급(후에 소각 전제)

        tokenId = ++_nextTokenId;
        policyToken[policyId] = tokenId;
        _safeMint(to, tokenId);
    }

    /// @notice 지급 완료 시 Insurance가 소각
    function burn(uint256 tokenId) external onlyMinter {
        _burn(tokenId);
    }

    // ── Views ──────────────────────────────────────────────────────────────
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
