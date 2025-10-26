import 'dotenv/config';
import { ethers } from 'ethers';

const ERC165_ABI = ['function supportsInterface(bytes4) view returns (bool)'];
const ERC1155_ABI = ['function balanceOf(address account, uint256 id) view returns (uint256)'];
const IFACE_ERC1155 = '0xd9b67a26';

function getProvider() {
  if (!process.env.RPC_URL) throw new Error('Missing RPC_URL');
  return new ethers.JsonRpcProvider(process.env.RPC_URL);
}

/**
 * ERC-1155 보유 여부만 판단 (balanceOf > 0n)
 * @param {object} p
 * @param {string} p.wallet        - 지갑 주소
 * @param {string} p.nftAddress    - ERC-1155 컨트랙트 주소
 * @param {bigint|number|string} p.tokenId - 토큰 ID
 * @param {number} [p.blockTag]    - 특정 블록 번호 시점(옵션)
 */
export async function verify1155Owned({ wallet, nftAddress, tokenId, blockTag }) {
  const provider = getProvider();

  // 1) 체인 가드
  const net = await provider.getNetwork();
  const chainHex = '0x' + net.chainId.toString(16);
  if (process.env.EXPECTED_CHAIN_ID &&
      chainHex.toLowerCase() !== process.env.EXPECTED_CHAIN_ID.toLowerCase()) {
    return { ok: false, reason: `WRONG_CHAIN(${chainHex})` };
  }

  // 2) 컨트랙트 존재 확인
  const code = await provider.getCode(nftAddress);
  if (!code || code === '0x') return { ok: false, reason: 'NOT_A_CONTRACT' };

  // 3) ERC-1155 지원 확인
  const i165 = new ethers.Contract(nftAddress, ERC165_ABI, provider);
  let is1155 = false;
  try { is1155 = await i165.supportsInterface(IFACE_ERC1155); } catch {}
  if (!is1155) return { ok: false, reason: 'NOT_ERC1155' };

  // 4) 보유 여부 (balanceOf > 0)
  const c1155 = new ethers.Contract(nftAddress, ERC1155_ABI, provider);
  const bn = await c1155.balanceOf(wallet, tokenId, blockTag ? { blockTag } : {});
  const owned = BigInt(bn.toString()) > 0n;

  return {
    ok: owned,
    reason: owned ? 'OK' : 'ZERO_BALANCE',
    owned,
    standard: 'ERC1155',
    blockTag: blockTag ?? 'latest'
  };
}
