"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/common/components/dialog";
import { Button } from "@/features/common/components/button";
import { Card } from "@/features/common/components/card";
import { useNexus } from "@avail-project/nexus-widgets";
import { ArrowRight, CreditCard, ArrowLeftRight, Zap } from "lucide-react";
import BridgePayment from "@/features/bridge/components/BridgePayment";
import SwapPayment from "@/features/swap/components/SwapPayment";
import DirectPayment from "../payment/DirectPayment";
import { useInsuranceContract } from "../../hooks/useInsuranceContract";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    premium: string;
    coverage: string;
  };
  onPaymentSuccess: (txHash?: string) => void;
}

type PaymentMethod = "direct" | "bridge" | "swap";

export default function PaymentModal({
  isOpen,
  onClose,
  product,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;

  const walletAddress = "0x..."; // 지갑 주소는 별도로 관리
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
    }
  }, [isOpen]);

  const { callApplyPolicy } = useInsuranceContract();

  const handlePayment = async (method: PaymentMethod) => {
    if (!isConnected) {
      alert("지갑을 먼저 연결해주세요.");
      return;
    }

    setSelectedMethod(method);
  };

  const handlePaymentSuccess = async (_txHash: string) => {
    // 성공 후 컨트랙트 호출
    try {
      // 임시 값 (실제로는 상품 ID와 커버리지 금액을 동적으로 받아야 함)
      const productId = parseInt(product.id.replace(/[^0-9]/g, "")) || 1;
      const coverageAmount = "10"; // 예시 값

      await callApplyPolicy({
        amount: product.premium.replace(/[^0-9.]/g, ""),
        productId,
        coverageAmount,
        onSuccess: (contractTxHash) => {
          console.log("컨트랙트 호출 성공:", contractTxHash);
          // 결제와 컨트랙트 호출 모두 성공
          onPaymentSuccess(contractTxHash);
        },
        onError: (error) => {
          console.error("컨트랙트 호출 실패:", error);
          alert(`보험 가입에 실패했습니다: ${error}`);
        },
      });
    } catch (error) {
      console.error("컨트랙트 호출 오류:", error);
      alert("보험 가입 중 오류가 발생했습니다.");
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`결제에 실패했습니다: ${error}`);
  };

  // 이전 단계로 돌아가기
  const handleBackToMethodSelection = () => {
    setSelectedMethod(null);
  };

  const paymentMethods = [
    {
      id: "direct" as PaymentMethod,
      name: "직접 결제",
      description: "현재 체인의 토큰으로 직접 결제",
      icon: CreditCard,
      color: "from-blue-500 to-blue-600",
      disabled: false,
    },
    {
      id: "bridge" as PaymentMethod,
      name: "브릿지 결제",
      description: "다른 체인에서 토큰을 브릿지하여 결제",
      icon: ArrowLeftRight,
      color: "from-purple-500 to-purple-600",
      disabled: false,
    },
    {
      id: "swap" as PaymentMethod,
      name: "스왑 결제",
      description: "다른 토큰을 스왑하여 결제",
      icon: Zap,
      color: "from-green-500 to-green-600",
      disabled: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            보험 가입 결제
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 상품 정보 */}
          <Card className="p-4 bg-slate-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-slate-600">{product.coverage}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">
                  {product.premium}
                </p>
                <p className="text-sm text-slate-500">연간 보험료</p>
              </div>
            </div>
          </Card>

          {/* 지갑 연결 상태 */}
          {!isConnected ? (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">
                지갑을 먼저 연결해주세요.
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 font-medium">
                지갑 연결됨: {walletAddress?.slice(0, 6)}...
                {walletAddress?.slice(-4)}
              </p>
            </div>
          )}

          {/* 결제 방식 선택 */}
          {!selectedMethod && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">결제 방식 선택</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Card
                      key={method.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        method.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() =>
                        !method.disabled && handlePayment(method.id)
                      }
                    >
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-semibold mb-2">{method.name}</h5>
                        <p className="text-sm text-slate-600">
                          {method.description}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 결제 컴포넌트 */}
          {/* 직접 결제 */}
          {selectedMethod === "direct" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={handleBackToMethodSelection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  뒤로
                </Button>
                <h4 className="font-semibold text-lg">직접 결제</h4>
              </div>
              <DirectPayment
                amount={product.premium.replace(/[^0-9.]/g, "")}
                onSuccess={() => handlePaymentSuccess("")}
                onError={handlePaymentError}
              />
            </div>
          )}

          {/* 브릿지 결제 */}
          {selectedMethod === "bridge" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={handleBackToMethodSelection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  뒤로
                </Button>
                <h4 className="font-semibold text-lg">브릿지 결제</h4>
              </div>
              <BridgePayment
                amount={product.premium.replace(/[^0-9.]/g, "")}
                onSuccess={() => handlePaymentSuccess("")}
                onError={handlePaymentError}
              />
            </div>
          )}

          {/* 스왑 결제 */}
          {selectedMethod === "swap" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  onClick={handleBackToMethodSelection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  뒤로
                </Button>
                <h4 className="font-semibold text-lg">스왑 결제</h4>
              </div>
              <SwapPayment
                amount={product.premium.replace(/[^0-9.]/g, "")}
                fromToken="USDC"
                onSuccess={() => handlePaymentSuccess("")}
                onError={handlePaymentError}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
