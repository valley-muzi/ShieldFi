'use client';

import React, { useState } from 'react';
import { Button } from '@/features/common/components/button';
import { Card } from '@/features/common/components/card';
import { useNexus } from '@avail-project/nexus-widgets';
import { ArrowLeftRight, CheckCircle, AlertCircle } from 'lucide-react';
import { BridgeButton } from '@avail-project/nexus-widgets';

interface BridgePaymentProps {
  amount: string;
  token: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function BridgePayment({ amount, token, onSuccess, onError }: BridgePaymentProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;
  const [isBridging, setIsBridging] = useState(false);
  const [step, setStep] = useState<'preparation' | 'bridging' | 'success' | 'error'>('preparation');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBridgeSuccess = () => {
    setStep('success');
    onSuccess();
  };

  const handleBridgeError = (error: string) => {
    setStep('error');
    setErrorMessage(error);
    onError(error);
  };

  const getStepIcon = () => {
    switch (step) {
      case 'preparation':
        return <ArrowLeftRight className="w-6 h-6 text-blue-600" />;
      case 'bridging':
        return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'preparation':
        return '브릿지 준비 완료';
      case 'bridging':
        return '브릿지 진행 중...';
      case 'success':
        return '브릿지 완료!';
      case 'error':
        return '브릿지 실패';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'preparation':
        return `${amount} ${token}을 다른 체인으로 브릿지합니다.`;
      case 'bridging':
        return '트랜잭션을 처리하고 있습니다. 잠시만 기다려주세요.';
      case 'success':
        return '토큰이 성공적으로 브릿지되었습니다.';
      case 'error':
        return errorMessage;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getStepIcon()}
          <div>
            <h3 className="font-semibold text-lg">{getStepText()}</h3>
            <p className="text-slate-600">{getStepDescription()}</p>
          </div>
        </div>

        {step === 'preparation' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">브릿지 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">금액:</span>
                  <span className="font-medium">{amount} {token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">수수료:</span>
                  <span className="font-medium">~0.001 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">예상 시간:</span>
                  <span className="font-medium">2-5분</span>
                </div>
              </div>
            </div>

            <BridgeButton 
              prefill={{ 
                chainId: 137, // Polygon
                token: 'USDC', 
                amount: amount 
              }}
            >
              {({ onClick, isLoading }) => (
                <Button
                  onClick={onClick}
                  disabled={!isConnected || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white"
                >
                  {isLoading ? '브릿지 진행 중...' : '브릿지 시작'}
                </Button>
              )}
            </BridgeButton>
          </div>
        )}

        {step === 'bridging' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">트랜잭션 확인 중...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">브릿지 실행 중...</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">브릿지가 성공적으로 완료되었습니다!</span>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">브릿지에 실패했습니다.</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
