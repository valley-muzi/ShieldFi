/**
 * ShieldFi 컨트랙트 연결 유틸리티
 * ethers.js를 사용하여 컨트랙트와 상호작용
 */

import { ethers } from 'ethers';
import { SEPOLIA_CONTRACTS, NETWORK_CONFIG } from './contracts';

// 컨트랙트 ABI import
import InsuranceABI from './contracts/Insurance.json';
import TreasuryABI from './contracts/Treasury.json';
import PolicyNFTABI from './contracts/PolicyNFT.json';

export interface ContractInstance {
  insurance: ethers.Contract;
  treasury: ethers.Contract;
  policyNFT: ethers.Contract;
}

/**
 * 컨트랙트 인스턴스 생성
 * @param provider ethers provider (MetaMask 등)
 * @returns 컨트랙트 인스턴스들
 */
export const createContractInstances = (provider: ethers.Provider): ContractInstance => {
  const insurance = new ethers.Contract(
    SEPOLIA_CONTRACTS.INSURANCE,
    InsuranceABI.abi,
    provider
  );

  const treasury = new ethers.Contract(
    SEPOLIA_CONTRACTS.TREASURY,
    TreasuryABI.abi,
    provider
  );

  const policyNFT = new ethers.Contract(
    SEPOLIA_CONTRACTS.POLICY_NFT,
    PolicyNFTABI.abi,
    provider
  );

  return {
    insurance,
    treasury,
    policyNFT,
  };
};

/**
 * 컨트랙트 인스턴스 생성 (서명자 포함)
 * @param signer ethers signer (MetaMask 등)
 * @returns 컨트랙트 인스턴스들 (서명 가능)
 */
export const createContractInstancesWithSigner = (signer: ethers.Signer): ContractInstance => {
  const insurance = new ethers.Contract(
    SEPOLIA_CONTRACTS.INSURANCE,
    InsuranceABI.abi,
    signer
  );

  const treasury = new ethers.Contract(
    SEPOLIA_CONTRACTS.TREASURY,
    TreasuryABI.abi,
    signer
  );

  const policyNFT = new ethers.Contract(
    SEPOLIA_CONTRACTS.POLICY_NFT,
    PolicyNFTABI.abi,
    signer
  );

  return {
    insurance,
    treasury,
    policyNFT,
  };
};

/**
 * 현재 네트워크가 Sepolia인지 확인
 * @param provider ethers provider
 * @returns Sepolia 네트워크 여부
 */
export const isConnectedToSepolia = async (provider: ethers.Provider): Promise<boolean> => {
  try {
    const network = await provider.getNetwork();
    return network.chainId === BigInt(NETWORK_CONFIG.SEPOLIA.chainId);
  } catch (error) {
    console.error('네트워크 확인 실패:', error);
    return false;
  }
};

/**
 * Sepolia 네트워크로 전환 요청
 * @param ethereum window.ethereum 객체
 */
export const requestSepoliaNetwork = async (ethereum: any): Promise<void> => {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${NETWORK_CONFIG.SEPOLIA.chainId.toString(16)}` }],
    });
  } catch (switchError: any) {
    // 네트워크가 없으면 추가
    if (switchError.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${NETWORK_CONFIG.SEPOLIA.chainId.toString(16)}`,
            chainName: NETWORK_CONFIG.SEPOLIA.name,
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [NETWORK_CONFIG.SEPOLIA.rpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.SEPOLIA.blockExplorer],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};
