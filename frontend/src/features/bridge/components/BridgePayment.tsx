'use client';

import React, { useState, useEffect } from 'react';
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
  const { provider, sdk, isSdkInitialized } = useNexus();
  const isConnected = !!provider;
  const [isBridging, setIsBridging] = useState(false);
  const [step, setStep] = useState<'preparation' | 'bridging' | 'success' | 'error'>('preparation');
  const [errorMessage, setErrorMessage] = useState('');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const handleBridgeSuccess = () => {
    setStep('success');
    onSuccess();
  };

  const handleBridgeError = (error: string) => {
    setStep('error');
    setErrorMessage(error);
    onError(error);
  };

  // ETH balance check
  const checkEthBalance = async () => {
    if (!sdk || !isSdkInitialized) return;
    
    setIsCheckingBalance(true);
    try {
      const balances = await sdk.getUnifiedBalances();
      console.log('Total balances:', balances);
      const ethAsset = balances.find(asset => 
        asset.symbol === 'ETH' || asset.symbol === 'SepoliaETH'
      );
      if (ethAsset) {
        console.log('ETH balance:', ethAsset);
        setEthBalance(ethAsset.balance);
      } else {
        console.log('ETH balance not found');
      }
    } catch (error) {
      console.error('Balance check failed:', error);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Check balance on component mount
  useEffect(() => {
    if (isSdkInitialized) {
      checkEthBalance();
    }
  }, [isSdkInitialized]);

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
        return 'Bridge Ready';
      case 'bridging':
        return 'Bridging...';
      case 'success':
        return 'Bridge Complete!';
      case 'error':
        return 'Bridge Failed';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'preparation':
        return `Bridge ${amount} ${token} to another chain.`;
      case 'bridging':
        return 'Processing transaction. Please wait...';
      case 'success':
        return 'Tokens have been successfully bridged.';
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
              <h4 className="font-medium text-blue-900 mb-2">Bridge Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Amount:</span>
                  <span className="font-medium">0.001 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Target Chain:</span>
                  <span className="font-medium">Optimism Sepolia (11155420)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Current Balance:</span>
                  <span className="font-medium">
                    {isCheckingBalance ? 'Checking...' : `${ethBalance} SepoliaETH`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Fee:</span>
                  <span className="font-medium">~0.001 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Estimated Time:</span>
                  <span className="font-medium">2-5 minutes</span>
                </div>
              </div>
            </div>

            {isConnected ? (
              parseFloat(ethBalance) >= 0.0015 ? (
                <BridgeButton
                  prefill={{
                    chainId: 11155420, // Optimism Sepolia
                    token: 'ETH',
                    amount: '0.001'
                  }}
                >
                  {({ onClick, isLoading }) => (
                    <Button
                      onClick={() => {
                        onClick();
                        // Bridge start - modal close commented out
                        // onSuccess();
                      }}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white"
                    >
                      {isLoading ? 'Bridging...' : 'Start Bridge'}
                    </Button>
                  )}
                </BridgeButton>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Insufficient Balance</span>
                  </div>
                  <p className="text-sm text-red-600 mt-2">
                    Bridge from Sepolia to Optimism Sepolia (0.001 ETH)
                    <br />
                    Current Balance: {ethBalance} SepoliaETH
                    <br />
                    <a
                      href="https://sepoliafaucet.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Get test ETH from Sepolia Faucet
                    </a>
                  </p>
                </div>
              )
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Please connect wallet first</span>
                </div>
                <p className="text-sm text-yellow-600 mt-2">
                  To use bridge, please connect MetaMask or another wallet.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'bridging' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">Waiting for transaction approval...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">Executing bridge...</span>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Bridge completed successfully!</span>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Bridge failed.</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
