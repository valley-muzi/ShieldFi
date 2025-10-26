'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/features/common/components/dialog';
import { Button } from '@/features/common/components/button';
import { Card } from '@/features/common/components/card';
import { useNexus } from '@avail-project/nexus-widgets';
import { ArrowRight, ArrowLeftRight, Zap } from 'lucide-react';
import BridgePayment from '@/features/bridge/components/BridgePayment';
import SwapPayment from '@/features/swap/components/SwapPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    premium: string;
    coverage: string;
  };
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'direct' | 'bridge' | 'swap';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  product, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;
  const walletAddress = '0x...'; // Wallet address managed separately
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handlePayment = async (method: PaymentMethod) => {
    if (!isConnected) {
      alert('Please connect wallet first.');
      return;
    }

    setSelectedMethod(method);
  };

  const handlePaymentSuccess = () => {
    // Close modal
    onClose();
    // Navigate to completion screen
    // onPaymentSuccess();
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  // Go back to method selection
  const handleBackToMethodSelection = () => {
    setSelectedMethod(null);
  };

  const paymentMethods = [
    {
      id: 'bridge' as PaymentMethod,
      name: 'Bridge Payment',
      description: 'Bridge tokens from another chain to pay',
      icon: ArrowLeftRight,
      color: 'from-purple-500 to-purple-600',
      disabled: false
    },
    {
      id: 'swap' as PaymentMethod,
      name: 'Swap Payment',
      description: 'Swap other tokens to pay',
      icon: Zap,
      color: 'from-green-500 to-green-600',
      disabled: false
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Insurance Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <Card className="p-4 bg-slate-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-slate-600">{product.coverage}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">{product.premium}</p>
                <p className="text-sm text-slate-500">Annual Premium</p>
              </div>
            </div>
          </Card>

          {/* Payment Method Selection */}
          {!selectedMethod && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">If you don't have enough ETH, use Bridge/Swap!</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card
                      key={method.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        method.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => !method.disabled && handlePayment(method.id)}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-semibold mb-2">{method.name}</h5>
                        <p className="text-sm text-slate-600">{method.description}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Components */}
          {selectedMethod === 'bridge' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={handleBackToMethodSelection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <h4 className="font-semibold text-lg">Bridge Payment</h4>
              </div>
              <BridgePayment
                amount="0.0015"
                token="ETH"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}

          {selectedMethod === 'swap' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={handleBackToMethodSelection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back
                </Button>
                <h4 className="font-semibold text-lg">Swap Payment</h4>
              </div>
              <SwapPayment
                amount="0.0015"
                fromToken="ETH"
                toToken="USDC"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          )}

          {/* Insurance Signup Button */}
          {selectedMethod && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Complete Insurance Signup</h4>
                <p className="text-blue-700 text-sm mb-4">
                  Complete your insurance signup process
                </p>
                <Button
                  onClick={() => {
                    // Navigate to insurance signup completion page
                    onClose();
                    onPaymentSuccess();
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
                >
                  Complete Insurance Signup
                </Button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
