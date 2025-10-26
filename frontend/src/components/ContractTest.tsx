'use client';

import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract } from 'wagmi';
import { Button } from '@/features/common/components/button';
import { Card } from '@/features/common/components/card';
import { CONTRACT_ADDRESSES, NETWORK_INFO } from '@/lib/wagmi';
import { INSURANCE_ABI, TREASURY_ABI, POLICY_NFT_ABI } from '@/lib/contract-abi';
import { CheckCircle, AlertCircle, Wallet, Network } from 'lucide-react';

export default function ContractTest() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('준비 중...');

  // 컨트랙트 읽기 테스트
  const { data: insurancePaused } = useReadContract({
    address: CONTRACT_ADDRESSES.INSURANCE,
    abi: INSURANCE_ABI,
    functionName: 'paused',
  });

  const { data: treasuryPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY,
    abi: TREASURY_ABI,
    functionName: 'paused',
  });

  const { data: nftTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.POLICY_NFT,
    abi: POLICY_NFT_ABI,
    functionName: 'totalSupply',
  });

  // 보험 가입 테스트 (0.001 ETH)
  const handlePurchasePolicy = async () => {
    if (!isConnected) {
      setStatus('지갑을 먼저 연결해주세요.');
      return;
    }

    if (chainId !== NETWORK_INFO.chainId) {
      setStatus('Sepolia 네트워크로 전환해주세요.');
      return;
    }

    setIsLoading(true);
    setStatus('보험 가입 중...');

    try {
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.INSURANCE,
        abi: INSURANCE_ABI,
        functionName: 'purchasePolicy',
        args: [
          BigInt('1000000000000000'), // 0.001 ETH in wei (premium)
          BigInt('10000000000000000'), // 0.01 ETH in wei (coverage)
          BigInt('31536000'), // 1 year in seconds (duration)
        ],
        value: BigInt('1000000000000000'), // 0.001 ETH
      });

      setStatus(`보험 가입 성공! 트랜잭션: ${result}`);
    } catch (error: any) {
      console.error('보험 가입 실패:', error);
      setStatus(`보험 가입 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isSepoliaNetwork = chainId === NETWORK_INFO.chainId;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">ShieldFi 컨트랙트 연결 테스트</h2>
        
        {/* 연결 상태 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">지갑 연결 상태:</span>
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>연결됨 ({address?.slice(0, 6)}...{address?.slice(-4)})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>연결되지 않음</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            <span className="font-medium">네트워크:</span>
            {isSepoliaNetwork ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Sepolia ({chainId})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>잘못된 네트워크 ({chainId})</span>
              </div>
            )}
          </div>
        </div>

        {/* 연결/해제 버튼 */}
        <div className="flex gap-4 mt-4">
          {isConnected ? (
            <Button onClick={() => disconnect()} variant="outline">
              연결 해제
            </Button>
          ) : (
            <Button onClick={() => connect({ connector: connectors[0] })}>
              지갑 연결
            </Button>
          )}
        </div>
      </Card>

      {/* 컨트랙트 상태 */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">컨트랙트 상태</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Insurance 컨트랙트</h4>
            <div className="text-sm space-y-1">
              <div><strong>주소:</strong> {CONTRACT_ADDRESSES.INSURANCE}</div>
              <div><strong>상태:</strong> {insurancePaused ? '일시정지' : '활성'}</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Treasury 컨트랙트</h4>
            <div className="text-sm space-y-1">
              <div><strong>주소:</strong> {CONTRACT_ADDRESSES.TREASURY}</div>
              <div><strong>상태:</strong> {treasuryPaused ? '일시정지' : '활성'}</div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">PolicyNFT 컨트랙트</h4>
            <div className="text-sm space-y-1">
              <div><strong>주소:</strong> {CONTRACT_ADDRESSES.POLICY_NFT}</div>
              <div><strong>총 발행량:</strong> {nftTotalSupply?.toString() || '0'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 테스트 기능 */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">컨트랙트 테스트</h3>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">보험 가입 테스트</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Sepolia 테스트넷에서 0.001 ETH로 보험을 가입합니다.
            </p>
            <Button 
              onClick={handlePurchasePolicy}
              disabled={!isConnected || !isSepoliaNetwork || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
            >
              {isLoading ? '가입 중...' : '보험 가입 (0.001 ETH)'}
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">상태</h4>
            <p className="text-sm text-gray-700">{status}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
