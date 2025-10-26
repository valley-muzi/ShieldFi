"use client";

import { useState, useEffect } from 'react';
import { NexusSDK } from '@avail-project/nexus-core';
import { BridgeButton, TransferButton } from '@avail-project/nexus-widgets';
import { checkSepoliaConnection } from '@/lib/sepolia-network';
import { connectToMetaMaskWithSepolia, detectWallets } from '@/lib/wallet-detection';

interface NexusTestProps {
  onStatusChange?: (status: string) => void;
}

export default function NexusSepoliaTest({ onStatusChange }: NexusTestProps) {
  const [sdk, setSdk] = useState<NexusSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SDK 초기화 (메타마스크 우선 + Sepolia 자동 전환)
  const initializeSDK = async () => {
    setLoading(true);
    setError(null);

    try {
      // 메타마스크로 연결하고 Sepolia로 자동 전환
      const result = await connectToMetaMaskWithSepolia();
      
      if (!result.switchedToSepolia) {
        setError('Sepolia 네트워크 전환에 실패했습니다.');
        return;
      }

      // Sepolia 네트워크 확인
      const connection = await checkSepoliaConnection();
      if (!connection.isConnected) {
        setError('지갑에 연결되지 않았습니다.');
        return;
      }

      if (!connection.isSepolia) {
        setError('Sepolia 네트워크로 전환해주세요.');
        return;
      }

      // Nexus SDK 초기화
      const nexusSDK = new NexusSDK({ network: 'testnet' });
      await nexusSDK.initialize(window.ethereum);
      
      setSdk(nexusSDK);
      setIsInitialized(true);
      onStatusChange?.('Nexus SDK 초기화 완료 (메타마스크 + Sepolia)');

      // 잔액 조회
      const userBalances = await nexusSDK.getUnifiedBalances();
      setBalances(userBalances);

    } catch (err: any) {
      console.error('SDK 초기화 오류:', err);
      
      // 메타마스크 연결 실패 시 다른 지갑 정보 표시
      const detection = detectWallets();
      if (detection.wallets.length > 0) {
        setError(`메타마스크 연결 실패. 설치된 지갑: ${detection.wallets.map(w => w.name).join(', ')}`);
      } else {
        setError('설치된 지갑이 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 잔액 새로고침
  const refreshBalances = async () => {
    if (!sdk) return;

    try {
      const userBalances = await sdk.getUnifiedBalances();
      setBalances(userBalances);
    } catch (err) {
      console.error('잔액 조회 실패:', err);
    }
  };

  // ETH 브릿지 시뮬레이션 테스트
  const testBridgeSimulation = async () => {
    if (!sdk) return;

    try {
      const simulation = await sdk.simulateBridge({
        token: 'ETH',
        amount: 0.0015,
        chainId: 11155111, // Sepolia
      });

      console.log('ETH 브릿지 시뮬레이션 결과:', simulation);
      onStatusChange?.(`ETH 브릿지 시뮬레이션 완료: ${simulation.success ? '성공' : '실패'}`);
    } catch (err: any) {
      console.error('ETH 브릿지 시뮬레이션 실패:', err);
      setError(`ETH 브릿지 시뮬레이션 실패: ${err.message}`);
    }
  };

  // 전송 시뮬레이션 테스트
  const testTransferSimulation = async () => {
    if (!sdk) return;

    try {
      const simulation = await sdk.simulateTransfer({
        token: 'ETH',
        amount: 0.0015,
        chainId: 11155111, // Sepolia
        recipient: '0x742d35Cc6634C0532925a3b8D4C9db96c4b4Db45', // 테스트 주소
      });

      console.log('전송 시뮬레이션 결과:', simulation);
      onStatusChange?.(`전송 시뮬레이션 완료: ${simulation.success ? '성공' : '실패'}`);
    } catch (err: any) {
      console.error('전송 시뮬레이션 실패:', err);
      setError(`전송 시뮬레이션 실패: ${err.message}`);
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 자동 초기화
    initializeSDK();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Nexus SDK Sepolia 테스트</h2>

      {/* 상태 표시 */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            SDK 상태: {isInitialized ? '초기화됨' : '초기화 안됨'}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* 초기화 버튼 */}
      <div className="mb-4">
        <button
          onClick={initializeSDK}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? '초기화 중...' : 'SDK 초기화'}
        </button>
      </div>

      {/* 잔액 정보 */}
      {balances.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">현재 잔액:</h3>
          <div className="space-y-1">
            {balances.map((balance, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{balance.symbol}:</span>
                <span>{balance.balance}</span>
              </div>
            ))}
          </div>
          <button
            onClick={refreshBalances}
            className="mt-2 text-xs text-blue-500 hover:text-blue-700"
          >
            잔액 새로고침
          </button>
        </div>
      )}

      {/* 테스트 버튼들 */}
      {isInitialized && (
        <div className="space-y-3">
          <h3 className="font-medium">테스트 기능:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={testBridgeSimulation}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              ETH 브릿지 시뮬레이션 테스트
            </button>

            <button
              onClick={testTransferSimulation}
              className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
            >
              전송 시뮬레이션 테스트
            </button>
          </div>
        </div>
      )}

      {/* Nexus Widgets 테스트 */}
      {isInitialized && (
        <div className="mt-6 space-y-4">
          <h3 className="font-medium">Nexus Widgets 테스트:</h3>
          
          {/* 브릿지 버튼 */}
          <div className="p-4 border rounded">
            <h4 className="font-medium mb-2">브릿지 버튼 (Sepolia ETH → 다른 체인)</h4>
            <BridgeButton prefill={{ chainId: 11155111, token: 'ETH', amount: '0.0015' }}>
              {({ onClick, isLoading }) => (
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
                >
                  {isLoading ? '브릿지 중...' : '0.0015 ETH 브릿지 테스트'}
                </button>
              )}
            </BridgeButton>
          </div>

          {/* 전송 버튼 */}
          <div className="p-4 border rounded">
            <h4 className="font-medium mb-2">전송 버튼</h4>
            <TransferButton
              prefill={{
                chainId: 11155111,
                token: 'ETH',
                amount: '0.0015',
                recipient: '0x742d35Cc6634C0532925a3b8D4C9db96c4b4Db45',
              }}
            >
              {({ onClick, isLoading }) => (
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
                >
                  {isLoading ? '전송 중...' : '0.0015 ETH 전송 테스트'}
                </button>
              )}
            </TransferButton>
          </div>
        </div>
      )}

      {/* 네트워크 정보 */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <div className="font-medium mb-1">테스트 환경:</div>
        <div>네트워크: Sepolia Testnet</div>
        <div>Chain ID: 11155111</div>
        <div>Nexus SDK: Testnet 모드</div>
      </div>
    </div>
  );
}
