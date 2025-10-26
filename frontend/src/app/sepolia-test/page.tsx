"use client";

import { useState } from 'react';
import EnhancedSepoliaNetworkManager from '@/components/EnhancedSepoliaNetworkManager';
import NexusSepoliaTest from '@/components/NexusSepoliaTest';

export default function SepoliaTestPage() {
  const [status, setStatus] = useState<string>('준비 중...');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sepolia 테스트넷 연결 및 Nexus SDK 테스트
          </h1>
          <p className="text-gray-600">
            메타마스크에 Sepolia 네트워크를 추가하고 Nexus SDK 기능을 테스트해보세요.
          </p>
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded text-blue-700">
            상태: {status}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 네트워크 관리 */}
          <div>
            <EnhancedSepoliaNetworkManager />
          </div>

          {/* Nexus SDK 테스트 */}
          <div>
            <NexusSepoliaTest onStatusChange={setStatus} />
          </div>
        </div>

        {/* 사용 가이드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">사용 가이드</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-green-600 mb-2">1단계: 지갑 연결 + Sepolia 자동 전환</h3>
              <p className="text-sm text-gray-600">
                왼쪽 패널에서 "메타마스크 연결 + Sepolia 전환" 버튼을 클릭하세요. 자동으로 Sepolia 테스트넷으로 전환됩니다.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-green-600 mb-2">2단계: Sepolia 네트워크 추가</h3>
              <p className="text-sm text-gray-600">
                "Sepolia 네트워크 추가 및 전환" 버튼을 클릭하여 Sepolia 테스트넷을 추가하고 전환하세요.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-green-600 mb-2">2단계: Nexus SDK 테스트</h3>
              <p className="text-sm text-gray-600">
                오른쪽 패널에서 "SDK 초기화" 버튼을 클릭하세요. 이미 Sepolia에 연결되어 있으므로 바로 테스트할 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-blue-600 mb-2">테스트 가능한 기능</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 메타마스크 우선 지갑 연결 + Sepolia 자동 전환</li>
                <li>• 지갑 선택 모달 (여러 지갑 설치 시)</li>
                <li>• 브릿지 시뮬레이션 (실제 트랜잭션 없이 비용 확인)</li>
                <li>• 전송 시뮬레이션 (실제 트랜잭션 없이 비용 확인)</li>
                <li>• Nexus Widgets 브릿지 버튼 (실제 브릿지 실행)</li>
                <li>• Nexus Widgets 전송 버튼 (실제 전송 실행)</li>
                <li>• 통합 잔액 조회 (모든 체인 잔액 확인)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-yellow-600 mb-2">주의사항</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sepolia 테스트넷에서만 테스트하세요 (실제 자산 손실 방지)</li>
                <li>• 테스트 ETH가 부족하면 faucet에서 받으세요</li>
                <li>• 시뮬레이션은 실제 트랜잭션을 발생시키지 않습니다</li>
                <li>• Widgets 버튼은 실제 트랜잭션을 실행합니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 네트워크 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Sepolia 네트워크 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">네트워크 설정</h3>
              <div className="text-sm space-y-1">
                <div><strong>네트워크 이름:</strong> Sepolia test network</div>
                <div><strong>Chain ID:</strong> 11155111</div>
                <div><strong>통화 기호:</strong> ETH</div>
                <div><strong>RPC URL:</strong> https://rpc.sepolia.org</div>
                <div><strong>블록 탐색기:</strong> https://sepolia.etherscan.io</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Nexus SDK 설정</h3>
              <div className="text-sm space-y-1">
                <div><strong>네트워크 모드:</strong> testnet</div>
                <div><strong>지원 토큰:</strong> ETH, USDC, USDT</div>
                <div><strong>지원 체인:</strong> Sepolia 포함 모든 테스트넷</div>
                <div><strong>디버그 모드:</strong> false</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
