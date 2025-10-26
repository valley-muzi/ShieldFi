import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { SEPOLIA_CONTRACTS } from './contracts';

// Sepolia 테스트넷 설정
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/0KnGD2ySjuK_RLLbX_XKE'),
  },
});

// 컨트랙트 주소들
export const CONTRACT_ADDRESSES = {
  INSURANCE: SEPOLIA_CONTRACTS.INSURANCE as `0x${string}`,
  TREASURY: SEPOLIA_CONTRACTS.TREASURY as `0x${string}`,
  POLICY_NFT: SEPOLIA_CONTRACTS.POLICY_NFT as `0x${string}`,
} as const;

// 네트워크 정보
export const NETWORK_INFO = {
  chainId: sepolia.id,
  name: sepolia.name,
  rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/0KnGD2ySjuK_RLLbX_XKE',
  blockExplorer: sepolia.blockExplorers.default.url,
} as const;
