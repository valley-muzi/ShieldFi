"use client";

import { useState, useEffect } from 'react';
import { 
  addSepoliaNetwork, 
  switchToSepolia, 
  checkSepoliaConnection,
  isSepoliaNetwork 
} from '@/lib/sepolia-network';
import { 
  connectToMetaMask,
  connectToMetaMaskWithSepolia, 
  detectWallets, 
  getCurrentWalletInfo,
  setupWalletChangeListener,
  WalletInfo 
} from '@/lib/wallet-detection';
import WalletSelectionModal from '@/components/WalletSelectionModal';

interface ConnectionStatus {
  isConnected: boolean;
  isSepolia: boolean;
  account: string | null;
  chainId: string | null;
  walletName: string | null;
}

export default function EnhancedSepoliaNetworkManager() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isSepolia: false,
    account: null,
    chainId: null,
    walletName: null,
  });
  const [loading, setLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  // 연결 상태 확인
  const checkConnection = async () => {
    const connectionStatus = await checkSepoliaConnection();
    const walletInfo = getCurrentWalletInfo();
    
    setStatus({
      ...connectionStatus,
      walletName: walletInfo?.name || null,
    });
  };

  // Sepolia 네트워크 추가 및 전환
  const handleAddSepoliaNetwork = async () => {
    setLoading(true);
    try {
      await addSepoliaNetwork();
      await switchToSepolia();
      await checkConnection();
    } catch (error) {
      console.error('Sepolia 네트워크 추가 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 메타마스크 우선 연결 (Sepolia 자동 전환)
  const connectWithMetaMaskPriority = async () => {
    setLoading(true);
    try {
      const result = await connectToMetaMaskWithSepolia();
      
      if (result.switchedToSepolia) {
        console.log('메타마스크 연결 및 Sepolia 네트워크 전환 완료');
        await checkConnection();
      } else {
        console.warn('Sepolia 네트워크 전환 실패');
        await checkConnection();
      }
    } catch (error: any) {
      console.error('메타마스크 연결 실패:', error);
      
      // 메타마스크 연결 실패 시 다른 지갑들 표시
      const detection = detectWallets();
      if (detection.wallets.length > 1) {
        setAvailableWallets(detection.wallets);
        setShowWalletModal(true);
      } else {
        alert('설치된 지갑이 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 지갑 선택 모달에서 지갑 선택
  const handleWalletSelect = async (wallet: WalletInfo) => {
    setLoading(true);
    try {
      const accounts = await wallet.provider.request({
        method: 'eth_requestAccounts',
        params: []
      });
      
      if (accounts && accounts.length > 0) {
        await checkConnection();
      }
    } catch (error) {
      console.error('지갑 연결 실패:', error);
    } finally {
      setLoading(false);
      setShowWalletModal(false);
    }
  };

  // Sepolia로 전환
  const handleSwitchToSepolia = async () => {
    setLoading(true);
    try {
      await switchToSepolia();
      await checkConnection();
    } catch (error) {
      console.error('Sepolia 전환 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // 지갑 변경 감지 설정
    setupWalletChangeListener(
      (account) => {
        console.log('계정 변경됨:', account);
        checkConnection();
      },
      (chainId) => {
        console.log('체인 변경됨:', chainId);
        checkConnection();
      }
    );
  }, []);

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Sepolia 네트워크 관리</h2>
        
        {/* 연결 상태 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {status.isConnected ? '지갑 연결됨' : '지갑 연결 안됨'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.isSepolia ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {status.isSepolia ? 'Sepolia 네트워크' : '다른 네트워크'}
            </span>
          </div>

          {status.account && (
            <div className="text-xs text-gray-600">
              계정: {status.account.slice(0, 6)}...{status.account.slice(-4)}
            </div>
          )}

          {status.walletName && (
            <div className="text-xs text-gray-600">
              지갑: {status.walletName}
            </div>
          )}

          {status.chainId && (
            <div className="text-xs text-gray-600">
              Chain ID: {parseInt(status.chainId, 16)}
            </div>
          )}
        </div>

        {/* 버튼들 */}
        <div className="space-y-2">
          {!status.isConnected && (
            <button
              onClick={connectWithMetaMaskPriority}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? '연결 중...' : '메타마스크 연결 + Sepolia 전환'}
            </button>
          )}

          {status.isConnected && !status.isSepolia && (
            <button
              onClick={handleAddSepoliaNetwork}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? '처리 중...' : 'Sepolia 네트워크 추가 및 전환'}
            </button>
          )}

          {status.isConnected && status.isSepolia && (
            <div className="text-center text-green-600 font-medium">
              ✅ Sepolia 네트워크 연결 완료!
            </div>
          )}

          <button
            onClick={checkConnection}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            연결 상태 새로고침
          </button>
        </div>

        {/* 네트워크 정보 */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <div className="font-medium mb-1">Sepolia 네트워크 정보:</div>
          <div>Chain ID: 11155111</div>
          <div>RPC: https://rpc.sepolia.org</div>
          <div>Explorer: https://sepolia.etherscan.io</div>
        </div>

        {/* 설치된 지갑 정보 */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
          <div className="font-medium mb-1">지갑 연결 우선순위:</div>
          <div>1. MetaMask (최우선)</div>
          <div>2. OKX Wallet</div>
          <div>3. 기타 지갑들</div>
        </div>
      </div>

      {/* 지갑 선택 모달 */}
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={handleWalletSelect}
      />
    </>
  );
}
