'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/features/common/components/card';
import { Button } from '@/features/common/components/button';
import { CheckCircle, ArrowRight, Home, History } from 'lucide-react';

export default function InsuranceSuccessPage() {
  const router = useRouter();

  const handleGoToHistory = () => {
    router.push('/history');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            보험 가입 완료!
          </h1>
          
          <p className="text-gray-600 mb-8">
            축하합니다! ShieldFi 보험 가입이 성공적으로 완료되었습니다.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                가입 정보
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">보험 상품:</span>
                    <span className="font-medium">DeFi 보험</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">보험료:</span>
                    <span className="font-medium">0.001 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">보장 금액:</span>
                    <span className="font-medium">0.01 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">보장 기간:</span>
                    <span className="font-medium">1년</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">결제 방법:</span>
                    <span className="font-medium">브릿지/스왑</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">
                다음 단계
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• 보험 정책 NFT가 지갑에 발행됩니다</li>
                <li>• 보험 가입 내역은 History 페이지에서 확인할 수 있습니다</li>
                <li>• 보험금 청구는 언제든지 가능합니다</li>
                <li>• 보장 기간 동안 자동으로 보호받습니다</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoToHistory}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
          >
            <History className="w-4 h-4" />
            보험 내역 보기
          </Button>
          
          <Button
            onClick={handleGoToHome}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
