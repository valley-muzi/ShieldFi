/**
 * Sepolia 테스트넷 네트워크 설정 유틸리티
 */

export interface SepoliaNetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const SEPOLIA_CONFIG: SepoliaNetworkConfig = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia test network',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.sepolia.org', // 공개 RPC
    'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Infura (키 필요)
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

/**
 * 메타마스크에 Sepolia 네트워크 추가
 */
export const addSepoliaNetwork = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('메타마스크가 설치되지 않았습니다.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [SEPOLIA_CONFIG],
    });
    console.log('Sepolia 네트워크가 성공적으로 추가되었습니다.');
  } catch (error: any) {
    if (error.code === 4902) {
      console.log('Sepolia 네트워크가 이미 추가되어 있습니다.');
    } else {
      console.error('Sepolia 네트워크 추가 실패:', error);
      throw error;
    }
  }
};

/**
 * Sepolia 네트워크로 전환
 */
export const switchToSepolia = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('메타마스크가 설치되지 않았습니다.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CONFIG.chainId }],
    });
    console.log('Sepolia 네트워크로 전환되었습니다.');
  } catch (error: any) {
    if (error.code === 4902) {
      // 네트워크가 추가되지 않은 경우 자동으로 추가 후 전환
      console.log('Sepolia 네트워크를 먼저 추가합니다...');
      await addSepoliaNetwork();
      await switchToSepolia();
    } else {
      console.error('Sepolia 네트워크 전환 실패:', error);
      throw error;
    }
  }
};

/**
 * 현재 네트워크가 Sepolia인지 확인
 */
export const isSepoliaNetwork = async (): Promise<boolean> => {
  if (!window.ethereum) {
    return false;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId === SEPOLIA_CONFIG.chainId;
  } catch (error) {
    console.error('네트워크 확인 실패:', error);
    return false;
  }
};

/**
 * 현재 연결된 계정 주소 가져오기
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('계정 정보 가져오기 실패:', error);
    return null;
  }
};

/**
 * Sepolia 네트워크 연결 상태 확인
 */
export const checkSepoliaConnection = async (): Promise<{
  isConnected: boolean;
  isSepolia: boolean;
  account: string | null;
  chainId: string | null;
}> => {
  if (!window.ethereum) {
    return {
      isConnected: false,
      isSepolia: false,
      account: null,
      chainId: null,
    };
  }

  try {
    const [accounts, chainId] = await Promise.all([
      window.ethereum.request({ method: 'eth_accounts' }),
      window.ethereum.request({ method: 'eth_chainId' }),
    ]);

    const account = accounts[0] || null;
    const isConnected = !!account;
    const isSepolia = chainId === SEPOLIA_CONFIG.chainId;

    return {
      isConnected,
      isSepolia,
      account,
      chainId,
    };
  } catch (error) {
    console.error('연결 상태 확인 실패:', error);
    return {
      isConnected: false,
      isSepolia: false,
      account: null,
      chainId: null,
    };
  }
};
