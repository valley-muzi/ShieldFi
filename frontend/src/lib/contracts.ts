/**
 * ShieldFi 컨트랙트 설정
 * Sepolia 테스트넷에 배포된 컨트랙트 주소와 ABI 정보
 */

// Sepolia 테스트넷 컨트랙트 주소들
export const SEPOLIA_CONTRACTS = {
  TREASURY: '0x6b4ac62CFd9C754E21c1f1B1d69c69539d190274',
  POLICY_NFT: '0x64650Fa048bB79dECA8f7828c1632cDf4f0222Dd',
  INSURANCE: '0x81265Ab23677fA9E119853b2a04e9498fB163db1',
} as const;

// 네트워크 설정
export const NETWORK_CONFIG = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/0KnGD2ySjuK_RLLbX_XKE',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
} as const;

// 컨트랙트 타입 정의
export type ContractName = keyof typeof SEPOLIA_CONTRACTS;
export type ContractAddress = typeof SEPOLIA_CONTRACTS[ContractName];

// 컨트랙트 주소 가져오기 헬퍼 함수
export const getContractAddress = (contractName: ContractName): ContractAddress => {
  return SEPOLIA_CONTRACTS[contractName];
};

// 현재 네트워크가 Sepolia인지 확인
export const isSepoliaNetwork = (chainId: number): boolean => {
  return chainId === NETWORK_CONFIG.SEPOLIA.chainId;
};
