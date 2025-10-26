'use client';

import React, { useState } from 'react';
import { Button } from '@/features/common/components/button';
import { Card } from '@/features/common/components/card';
import { useNexus } from '@avail-project/nexus-widgets';
import { Zap, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { TransferButton } from '@avail-project/nexus-widgets';

interface SwapPaymentProps {
  amount: string;
  fromToken: string;
  toToken: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function SwapPayment({ amount, fromToken, toToken, onSuccess, onError }: SwapPaymentProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;
  const [isSwapping, setIsSwapping] = useState(false);
  const [step, setStep] = useState<'preparation' | 'swapping' | 'success' | 'error'>('preparation');
  const [errorMessage, setErrorMessage] = useState('');
  const [swapRate, setSwapRate] = useState('1.02'); // Example swap rate

  const handleSwapSuccess = () => {
    setStep('success');
    onSuccess();
  };

  const handleSwapError = (error: string) => {
    setStep('error');
    setErrorMessage(error);
    onError(error);
  };

  const getStepIcon = () => {
    switch (step) {
      case 'preparation':
        return <Zap className="w-6 h-6 text-green-600" />;
      case 'swapping':
        return <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'preparation':
        return 'Swap Ready';
      case 'swapping':
        return 'Swapping...';
      case 'success':
        return 'Swap Complete!';
      case 'error':
        return 'Swap Failed';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'preparation':
        return `Swap ${amount} ${fromToken} to ${toToken}.`;
      case 'swapping':
        return 'Exchanging tokens. Please wait...';
      case 'success':
        return 'Tokens have been successfully swapped.';
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
            {/* Swap Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">Swap Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{fromToken}</span>
                    </div>
                    <span className="font-medium">{amount} {fromToken}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">{toToken}</span>
                    </div>
                    <span className="font-medium">{(parseFloat(amount) * parseFloat(swapRate)).toFixed(2)} {toToken}</span>
                  </div>
                </div>
                
                <div className="border-t border-green-200 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                        <span className="text-green-700">Swap Rate:</span>
                    <span className="font-medium">1 {fromToken} = {swapRate} {toToken}</span>
                  </div>
                  <div className="flex justify-between">
                        <span className="text-green-700">Fee:</span>
                    <span className="font-medium">0.3%</span>
                  </div>
                  <div className="flex justify-between">
                        <span className="text-green-700">Estimated Time:</span>
                        <span className="font-medium">1-2 minutes</span>
                  </div>
                </div>
              </div>
            </div>

                  {isConnected ? (
                    <TransferButton
                      prefill={{
                        chainId: 11155111, // Sepolia
                        token: 'ETH',
                        amount: '0.0015',
                        recipient: '0x2784177671da5525461296a2f170009339e92dc2'
                      }}
                    >
                      {({ onClick, isLoading }) => (
                        <Button
                          onClick={() => {
                            onClick();
                            // Swap start - modal close commented out
                            // onSuccess();
                          }}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white"
                        >
                          {isLoading ? 'Swapping...' : 'Start Swap'}
                        </Button>
                      )}
                    </TransferButton>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Please connect wallet first</span>
                      </div>
                      <p className="text-sm text-yellow-600 mt-2">
                        To use swap, please connect MetaMask or another wallet.
                      </p>
                    </div>
                  )}
          </div>
        )}

        {step === 'swapping' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700">Approving tokens...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700">Executing swap...</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Swap completed successfully!</span>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Swap failed.</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
