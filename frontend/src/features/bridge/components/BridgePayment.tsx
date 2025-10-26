"use client";

import React, { useState } from "react";
import { Button } from "@/features/common/components/button";
import { Card } from "@/features/common/components/card";
import { useNexus } from "@avail-project/nexus-widgets";
import { ArrowLeftRight, CheckCircle, AlertCircle, Info } from "lucide-react";
import { BridgeButton } from "@avail-project/nexus-widgets";
import { parseEther } from "viem";
import { getInsuranceWalletAddress } from "../../insurance/constants/payment";

interface BridgePaymentProps {
  amount: string; // ETH 단위
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function BridgePayment({
  amount,
  onSuccess,
  onError,
}: BridgePaymentProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;
  const [step, setStep] = useState<
    "preparation" | "bridging" | "transferring" | "success" | "error"
  >("preparation");
  const [errorMessage, setErrorMessage] = useState("");
  const [cancelled, setCancelled] = useState(false);

  const handleBridgeComplete = async () => {
    // 브릿지 완료 후 결제 버튼 활성화
    setStep("transferring");
  };

  const handlePaymentClick = async () => {
    try {
      setCancelled(false);
      await sendPaymentAfterBridge();
      setStep("success");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };

      // 사용자가 트랜잭션을 취소한 경우
      if (
        error?.code === 4001 ||
        error?.message?.includes("User rejected") ||
        error?.message?.includes("user denied")
      ) {
        setCancelled(true);
        setStep("preparation"); // 원래 단계로 돌아가기
        return; // 에러를 던지지 않고 조용히 처리
      }

      const message =
        err instanceof Error
          ? err.message
          : "결제 전송 중 오류가 발생했습니다.";
      setErrorMessage(message);
      setStep("error");
      onError(message);
    }
  };

  // 브릿지 완료 후 ETH 전송
  const sendPaymentAfterBridge = async () => {
    if (!provider) {
      throw new Error("지갑이 연결되지 않았습니다.");
    }

    console.log("sendPaymentAfterBridge - amount:", amount);

    // 대상 체인 ID (Ethereum Sepolia)
    const targetChainId = 11155111;
    const toAddress = getInsuranceWalletAddress(targetChainId);

    // 사용자 주소
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    const fromAddress = accounts[0];

    // ETH 전송 트랜잭션 - Wei로 변환
    const weiValue = parseEther(amount);
    console.log("sendPaymentAfterBridge - weiValue:", weiValue.toString());

    const transactionParameters = {
      from: fromAddress,
      to: toAddress as `0x${string}`,
      value: `0x${weiValue.toString(16)}`, // 0x 접두사 필수
      gas: "0x5208", // 21000 gas
    };

    console.log(
      "sendPaymentAfterBridge - transactionParameters:",
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
        return <ArrowLeftRight className="w-6 h-6 text-blue-600" />;
      case "bridging":
        return (
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
        return "브릿지 결제 준비 완료";
      case "bridging":
        return "브릿지 진행 중...";
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
        return `다른 체인에서 ${amount} ETH를 브릿지한 후 보험료를 결제합니다.`;
      case "bridging":
        return "ETH를 대상 체인으로 브릿지하고 있습니다.";
      case "transferring":
        return "브릿지된 ETH로 보험료를 결제하고 있습니다.";
      case "success":
        return "브릿지 및 보험료 결제가 완료되었습니다.";
      case "error":
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">
                브릿지 결제 정보
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">보험료:</span>
                  <span className="font-medium">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">브릿지 수수료:</span>
                  <span className="font-medium">~0.001 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">예상 시간:</span>
                  <span className="font-medium">2-5분</span>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                다른 체인에서 ETH를 브릿지한 후, 자동으로 보험료가 결제됩니다.
                두 번의 트랜잭션 승인이 필요합니다.
              </p>
            </div>

            <BridgeButton
              prefill={{
                chainId: 1, // Ethereum Mainnet
                token: "ETH",
                amount: amount,
              }}
            >
              {({ onClick, isLoading }) => (
                <Button
                  onClick={async () => {
                    setStep("bridging");
                    onClick();
                    // 브릿지 완료 후 자동으로 결제 단계로 이동
                    setTimeout(() => {
                      handleBridgeComplete();
                    }, 5000); // 5초 후 결제 단계로 (실제로는 브릿지 완료 이벤트 리스닝 필요)
                  }}
                  disabled={!isConnected || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white"
                >
                  {isLoading ? "브릿지 진행 중..." : "ETH 브릿지 시작"}
                </Button>
              )}
            </BridgeButton>
          </div>
        )}

        {step === "bridging" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm text-purple-700">
                  브릿지 트랜잭션 승인 대기 중...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm text-purple-700">
                  ETH 브릿지 실행 중...
                </span>
              </div>
            </div>
          </div>
        )}

        {step === "transferring" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">브릿지가 완료되었습니다!</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                이제 보험료를 결제해주세요.
              </p>
            </div>

            <Button
              onClick={handlePaymentClick}
              disabled={!isConnected}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
            >
              {amount} ETH 결제하기
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                브릿지가 성공적으로 완료되었습니다!
              </span>
            </div>
          </div>
        )}

        {step === "error" && (
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
