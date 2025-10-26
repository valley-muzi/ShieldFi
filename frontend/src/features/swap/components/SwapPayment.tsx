"use client";

import React, { useState } from "react";
import { Button } from "@/features/common/components/button";
import { Card } from "@/features/common/components/card";
import { useNexus } from "@avail-project/nexus-widgets";
import { Zap, CheckCircle, AlertCircle, ArrowRight, Info } from "lucide-react";
import { parseEther } from "viem";
import { getInsuranceWalletAddress } from "../../insurance/constants/payment";

interface SwapPaymentProps {
  amount: string; // ETH로 변환될 목표 금액
  fromToken: string; // 스왑할 토큰 (예: USDC, USDT 등)
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function SwapPayment({
  amount,
  fromToken,
  onSuccess,
  onError,
}: SwapPaymentProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;
  const [isSwapping, setIsSwapping] = useState(false);
  const [step, setStep] = useState<
    "preparation" | "swapping" | "transferring" | "success" | "error"
  >("preparation");
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelled, setCancelled] = useState(false);
  // 예시 스왑 비율 (실제로는 DEX에서 가져와야 함)
  const [swapRate] = useState<number>(fromToken === "USDC" ? 3000 : 1); // 1 ETH = 3000 USDC

  const handleSwapAndPay = async () => {
    if (!provider || !isConnected) {
      onError("지갑이 연결되지 않았습니다.");
      return;
    }

    setIsSwapping(true);
    setStep("swapping");

    try {
      setCancelled(false);
      // 1단계: 토큰을 ETH로 스왑 (실제로는 DEX 연동 필요)
      // 여기서는 간단히 시뮬레이션
      await simulateSwap();

      // 2단계: ETH 전송
      setStep("transferring");
      await sendPaymentAfterSwap();

      setStep("success");
      onSuccess();
    } catch (err: unknown) {
      console.error("Swap payment error:", err);
      const error = err as { code?: number; message?: string };

      // 사용자가 트랜잭션을 취소한 경우
      if (
        error?.code === 4001 ||
        error?.message?.includes("User rejected") ||
        error?.message?.includes("user denied")
      ) {
        setCancelled(true);
        setStep("preparation"); // 원래 단계로 돌아가기
        setIsSwapping(false);
        return; // 에러를 던지지 않고 조용히 처리
      }

      const message = error.message || "스왑 결제 중 오류가 발생했습니다.";
      setErrorMessage(message);
      setStep("error");
      onError(message);
    } finally {
      setIsSwapping(false);
    }
  };

  // 스왑 시뮬레이션 (실제로는 Uniswap, Sushiswap 등의 DEX 연동)
  const simulateSwap = async (): Promise<void> => {
    return new Promise((resolve) => {
      // 실제로는 여기서 DEX 라우터를 통해 스왑 실행
      setTimeout(resolve, 2000); // 2초 대기 (시뮬레이션)
    });
  };

  // 스왑 후 ETH 전송
  const sendPaymentAfterSwap = async () => {
    if (!provider) {
      throw new Error("지갑이 연결되지 않았습니다.");
    }

    console.log("sendPaymentAfterSwap - amount:", amount);

    // 체인 ID 확인
    const chainId = (await provider.request({
      method: "eth_chainId",
    })) as string;
    const chainIdNumber = parseInt(chainId, 16);

    // 보험사 지갑 주소
    const toAddress = getInsuranceWalletAddress(chainIdNumber);

    // 사용자 주소
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    const fromAddress = accounts[0];

    // ETH 전송 트랜잭션 - Wei로 변환 후 16진수 표시
    const weiValue = parseEther(amount);
    console.log("sendPaymentAfterSwap - weiValue:", weiValue.toString());

    const transactionParameters = {
      from: fromAddress,
      to: toAddress as `0x${string}`,
      value: `0x${weiValue.toString(16)}`, // 0x 접두사 필수
      gas: "0x5208", // 21000 gas
    };

    console.log(
      "sendPaymentAfterSwap - transactionParameters:",
      transactionParameters
    );

    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    })) as string;

    console.log("Payment transaction sent:", hash);

    // 트랜잭션 확인 대기
    await waitForTransaction(hash);
  };

  // 트랜잭션 확인 대기
  const waitForTransaction = async (hash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 60;

      const checkTransaction = async () => {
        try {
          const receipt = await provider?.request({
            method: "eth_getTransactionReceipt",
            params: [hash],
          });

          if (receipt) {
            resolve();
          } else if (attempts >= maxAttempts) {
            reject(new Error("트랜잭션 확인 시간 초과"));
          } else {
            attempts++;
            setTimeout(checkTransaction, 1000);
          }
        } catch (err) {
          reject(err);
        }
      };

      checkTransaction();
    });
  };

  const getStepIcon = () => {
    switch (step) {
      case "preparation":
        return <Zap className="w-6 h-6 text-green-600" />;
      case "swapping":
        return (
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        );
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getStepText = () => {
    switch (step) {
      case "preparation":
        return "스왑 결제 준비 완료";
      case "swapping":
        return "토큰 스왑 진행 중...";
      case "transferring":
        return "보험료 결제 중...";
      case "success":
        return "결제 완료!";
      case "error":
        return "결제 실패";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "preparation":
        return `${fromToken}을 ETH로 스왑한 후 보험료를 결제합니다.`;
      case "swapping":
        return `${fromToken}을 ETH로 교환하고 있습니다.`;
      case "transferring":
        return "스왑된 ETH로 보험료를 결제하고 있습니다.";
      case "success":
        return "스왑 및 보험료 결제가 완료되었습니다.";
      case "error":
        return errorMessage;
    }
  };

  // 스왑에 필요한 토큰 양 계산
  const requiredTokenAmount = (parseFloat(amount) * swapRate).toFixed(2);

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

        {/* 취소 알림 */}
        {cancelled && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">
                트랜잭션이 취소되었습니다. 다시 시도해주세요.
              </span>
            </div>
            <button
              onClick={() => setCancelled(false)}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {step === "preparation" && (
          <div className="space-y-4">
            {/* 스왑 정보 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">
                스왑 결제 정보
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">
                        {fromToken}
                      </span>
                    </div>
                    <span className="font-medium">
                      {requiredTokenAmount} {fromToken}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600">
                        ETH
                      </span>
                    </div>
                    <span className="font-medium">{amount} ETH</span>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">스왑 비율:</span>
                    <span className="font-medium">
                      1 ETH = {swapRate} {fromToken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">스왑 수수료:</span>
                    <span className="font-medium">0.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">예상 시간:</span>
                    <span className="font-medium">1-2분</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                {fromToken}을 ETH로 스왑한 후, 자동으로 보험료가 결제됩니다. 두
                번의 트랜잭션 승인이 필요합니다.
              </p>
            </div>

            <Button
              onClick={handleSwapAndPay}
              disabled={!isConnected || isSwapping}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white"
            >
              {isSwapping ? "처리 중..." : "스왑 & 결제 시작"}
            </Button>
          </div>
        )}

        {step === "swapping" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700">토큰 승인 중...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700">
                  {fromToken}을 ETH로 스왑 중...
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "transferring" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">스왑 완료!</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">보험료 결제 중...</span>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                스왑이 성공적으로 완료되었습니다!
              </span>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">스왑에 실패했습니다.</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
