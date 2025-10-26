/**
 * 지갑 감지 및 메타마스크 우선 연결 유틸리티
 */

export interface WalletInfo {
  name: string;
  isInstalled: boolean;
  provider: any;
  priority: number; // 낮을수록 우선순위 높음
}

export interface WalletDetectionResult {
  wallets: WalletInfo[];
  recommended: WalletInfo | null;
  metamask: WalletInfo | null;
}

/**
 * 설치된 지갑들을 감지하고 메타마스크를 우선순위로 설정
 */
export const detectWallets = (): WalletDetectionResult => {
  const wallets: WalletInfo[] = [];

  // 메타마스크 감지 (최우선)
  if (window.ethereum?.isMetaMask) {
    wallets.push({
      name: 'MetaMask',
      isInstalled: true,
      provider: window.ethereum,
      priority: 1, // 최우선
    });
  }

  // OKX 지갑 감지
  if (window.okxwallet) {
    wallets.push({
      name: 'OKX Wallet',
      isInstalled: true,
      provider: window.okxwallet,
      priority: 2,
    });
  }

  // Coinbase Wallet 감지
  if (window.ethereum?.isCoinbaseWallet) {
    wallets.push({
      name: 'Coinbase Wallet',
      isInstalled: true,
      provider: window.ethereum,
      priority: 3,
    });
  }

  // Trust Wallet 감지
  if (window.ethereum?.isTrust) {
    wallets.push({
      name: 'Trust Wallet',
      isInstalled: true,
      provider: window.ethereum,
      priority: 4,
    });
  }

  // Rainbow Wallet 감지
  if (window.ethereum?.isRainbow) {
    wallets.push({
      name: 'Rainbow Wallet',
      isInstalled: true,
      provider: window.ethereum,
      priority: 5,
    });
  }

  // 우선순위별로 정렬
  wallets.sort((a, b) => a.priority - b.priority);

  const metamask = wallets.find(wallet => wallet.name === 'MetaMask') || null;
  const recommended = wallets.length > 0 ? wallets[0] : null;

  return {
    wallets,
    recommended,
    metamask,
  };
};

/**
 * 메타마스크로 강제 연결
 */
export const connectToMetaMask = async (): Promise<string> => {
  const detection = detectWallets();
  
  if (!detection.metamask) {
    throw new Error('메타마스크가 설치되지 않았습니다.');
  }

  try {
    // 메타마스크에 직접 연결 요청
    const accounts = await detection.metamask.provider.request({
      method: 'eth_requestAccounts',
      params: []
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('계정 연결이 거부되었습니다.');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('사용자가 연결을 거부했습니다.');
    } else if (error.code === -32002) {
      throw new Error('이미 연결 요청이 진행 중입니다.');
    } else {
      throw new Error(`메타마스크 연결 실패: ${error.message}`);
    }
  }
};

/**
 * 메타마스크로 연결하고 Sepolia 네트워크로 자동 전환
 */
export const connectToMetaMaskWithSepolia = async (): Promise<{
  account: string;
  switchedToSepolia: boolean;
}> => {
  const detection = detectWallets();
  
  if (!detection.metamask) {
    throw new Error('메타마스크가 설치되지 않았습니다.');
  }

  try {
    // 1. 메타마스크에 연결
    const accounts = await detection.metamask.provider.request({
      method: 'eth_requestAccounts',
      params: []
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('계정 연결이 거부되었습니다.');
    }

    // 2. 현재 네트워크 확인
    const currentChainId = await detection.metamask.provider.request({
      method: 'eth_chainId',
      params: []
    });

    const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
    let switchedToSepolia = false;

    // 3. Sepolia가 아니면 Sepolia로 전환
    if (currentChainId !== sepoliaChainId) {
      try {
        await detection.metamask.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }],
        });
        switchedToSepolia = true;
      } catch (switchError: any) {
        // 네트워크가 추가되지 않은 경우 자동으로 추가
        if (switchError.code === 4902) {
          await detection.metamask.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: sepoliaChainId,
              chainName: 'Sepolia test network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
          switchedToSepolia = true;
        } else {
          console.warn('Sepolia 네트워크 전환 실패:', switchError);
        }
      }
    } else {
      switchedToSepolia = true; // 이미 Sepolia에 있음
    }

    return {
      account: accounts[0],
      switchedToSepolia,
    };
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('사용자가 연결을 거부했습니다.');
    } else if (error.code === -32002) {
      throw new Error('이미 연결 요청이 진행 중입니다.');
    } else {
      throw new Error(`메타마스크 연결 실패: ${error.message}`);
    }
  }
};

/**
 * 사용자에게 지갑 선택 옵션 제공 (UI 모달 사용)
 */
export const showWalletSelectionWithUI = async (): Promise<string> => {
  const detection = detectWallets();
  
  if (detection.wallets.length === 0) {
    throw new Error('설치된 지갑이 없습니다.');
  }

  if (detection.wallets.length === 1) {
    // 지갑이 하나만 있으면 바로 연결
    const wallet = detection.wallets[0];
    const accounts = await wallet.provider.request({
      method: 'eth_requestAccounts',
      params: []
    });
    return accounts[0];
  }

  // 여러 지갑이 있으면 Promise로 UI에서 선택하게 함
  return new Promise((resolve, reject) => {
    // 이 함수는 UI 컴포넌트에서 호출되어야 함
    // 실제 구현에서는 React Context나 상태 관리 라이브러리 사용
    reject(new Error('UI 모달을 통한 지갑 선택이 필요합니다.'));
  });
};

/**
 * 지갑 선택 모달 (실제 구현에서는 UI 라이브러리 사용)
 */
const showWalletSelectionModal = async (walletNames: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 실제 구현에서는 React 모달이나 다른 UI 라이브러리 사용
    const userChoice = prompt(
      `다음 지갑 중 하나를 선택하세요:\n${walletNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\n번호를 입력하세요:`
    );
    
    const choiceIndex = parseInt(userChoice || '') - 1;
    if (choiceIndex >= 0 && choiceIndex < walletNames.length) {
      resolve(walletNames[choiceIndex]);
    } else {
      reject(new Error('유효하지 않은 선택입니다.'));
    }
  });
};

/**
 * 메타마스크 우선 자동 연결
 */
export const autoConnectWithMetaMaskPriority = async (): Promise<{
  account: string;
  walletName: string;
  provider: any;
}> => {
  const detection = detectWallets();
  
  if (!detection.wallets.length) {
    throw new Error('설치된 지갑이 없습니다.');
  }

  // 메타마스크가 있으면 우선 사용
  if (detection.metamask) {
    try {
      const account = await connectToMetaMask();
      return {
        account,
        walletName: 'MetaMask',
        provider: detection.metamask.provider,
      };
    } catch (error) {
      console.warn('메타마스크 연결 실패, 다른 지갑으로 시도:', error);
    }
  }

  // 메타마스크 연결 실패 시 다른 지갑 사용
  const fallbackWallet = detection.wallets.find(w => w.name !== 'MetaMask');
  if (!fallbackWallet) {
    throw new Error('사용 가능한 지갑이 없습니다.');
  }

  const accounts = await fallbackWallet.provider.request({
    method: 'eth_requestAccounts',
    params: []
  });

  return {
    account: accounts[0],
    walletName: fallbackWallet.name,
    provider: fallbackWallet.provider,
  };
};

/**
 * 현재 연결된 지갑 정보 가져오기
 */
export const getCurrentWalletInfo = (): WalletInfo | null => {
  const detection = detectWallets();
  
  // 현재 활성화된 지갑 감지
  if (window.ethereum?.isMetaMask) {
    return detection.metamask;
  }
  
  // 다른 지갑들 확인
  return detection.wallets.find(wallet => 
    wallet.provider === window.ethereum
  ) || null;
};

/**
 * 지갑 변경 감지
 */
export const setupWalletChangeListener = (
  onAccountChange: (account: string) => void,
  onChainChange: (chainId: string) => void
) => {
  if (!window.ethereum) return;

  // 계정 변경 감지
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    if (accounts.length > 0) {
      onAccountChange(accounts[0]);
    }
  });

  // 체인 변경 감지
  window.ethereum.on('chainChanged', (chainId: string) => {
    onChainChange(chainId);
  });

  // 연결 해제 감지
  window.ethereum.on('disconnect', () => {
    console.log('지갑 연결이 해제되었습니다.');
  });
};
