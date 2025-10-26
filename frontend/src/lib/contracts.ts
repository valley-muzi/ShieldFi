import { Address } from 'viem';

// 컨트랙트 주소 설정
export const CONTRACT_ADDRESSES = {
  localhost: {
    Insurance: '0x05Aa229Aec102f78CE0E852A812a388F076Aa555' as Address,
    PolicyNFT: '0x1275D096B9DBf2347bD2a131Fb6BDaB0B4882487' as Address,
    Treasury: '0xC6bA8C3233eCF65B761049ef63466945c362EdD2' as Address,
  },
  sepolia: {
    Insurance: '0x0000000000000000000000000000000000000000' as Address, // TODO: Sepolia 주소 추가
    PolicyNFT: '0x0000000000000000000000000000000000000000' as Address,
    Treasury: '0x0000000000000000000000000000000000000000' as Address,
  },
} as const;

// 현재 네트워크 설정 (개발 환경에서는 localhost 사용)
export const CURRENT_NETWORK = 'localhost' as keyof typeof CONTRACT_ADDRESSES;

// Insurance 컨트랙트 ABI
export const INSURANCE_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'coverageAmount',
        type: 'uint256',
      },
    ],
    name: 'applyPolicy',
    outputs: [
      {
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
    ],
    name: 'activate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
    ],
    name: 'getPolicy',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'holder',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'productId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'premiumPaid',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'coverageAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'createdAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'activatedAt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
          {
            internalType: 'enum PolicyStatus',
            name: 'status',
            type: 'uint8',
          },
        ],
        internalType: 'struct Policy',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextPolicyId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'productId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'premiumPaid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'coverageAmount',
        type: 'uint256',
      },
    ],
    name: 'PolicyCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'activatedAt',
        type: 'uint256',
      },
    ],
    name: 'PolicyActivated',
    type: 'event',
  },
] as const;

// PolicyNFT 컨트랙트 ABI
export const POLICY_NFT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'tokenURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Treasury 컨트랙트 ABI
export const TREASURY_ABI = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'policyId',
        type: 'uint256',
      },
    ],
    name: 'refund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// 컨트랙트 주소 가져오기 헬퍼 함수
export const getContractAddress = (contractName: keyof typeof CONTRACT_ADDRESSES.localhost) => {
  return CONTRACT_ADDRESSES[CURRENT_NETWORK][contractName];
};

// 네트워크 설정
export const NETWORK_CONFIG = {
  localhost: {
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    name: 'Localhost',
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // TODO: 실제 RPC URL 설정
    name: 'Sepolia',
  },
} as const;
