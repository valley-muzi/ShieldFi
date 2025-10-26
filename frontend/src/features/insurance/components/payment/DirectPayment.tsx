"use client";

import React, { useState } from "react";
import { Button } from "@/features/common/components/button";
import { Card } from "@/features/common/components/card";
import { useNexus } from "@avail-project/nexus-widgets";
import { CreditCard, CheckCircle, AlertCircle, Info } from "lucide-react";
import { parseEther } from "viem";
import {
  getInsuranceWalletAddress,
  CHAIN_NAMES,
} from "../../constants/payment";

interface DirectPaymentProps {
  amount: string; // ETH 단위
  onSuccess: () => void;
  onError: (error: string) => void;
}

// 네트워크 정보
const NETWORKS: Record<
  number,
  { name: string; params: Record<string, unknown> }
> = {
  11155111: {
    // Ethereum Sepolia
    name: "Sepolia",
    params: {
      chainId: "0xaa36a7",
      chainName: "Sepolia",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://sepolia.infura.io/v3/"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    },
  },
  84532: {
    // Base Sepolia
    name: "Base Sepolia",
    params: {
      chainId: "0x14a34",
      chainName: "Base Sepolia",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://sepolia.base.org"],
      blockExplorerUrls: ["https://sepolia-explorer.base.org"],
    },
  },
};

export default function DirectPayment({
  amount,
  onSuccess,
  onError,
}: DirectPaymentProps) {
  const { provider } = useNexus();
  const isConnected = !!provider;
  const [isPaying, setIsPaying] = useState(false);
  const [step, setStep] = useState<
    "preparation" | "paying" | "success" | "error"
  >("preparation");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null); // 선택된 네트워크
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  // 현재 연결된 체인 확인
  React.useEffect(() => {
    const getChainId = async () => {
      if (provider && "request" in provider) {
        try {
          const chainId = (await provider.request({
            method: "eth_chainId",
          })) as string;
          setCurrentChainId(parseInt(chainId, 16));
          // 초기 선택은 현재 네트워크
          setSelectedNetwork(parseInt(chainId, 16));
        } catch (err) {
          console.error("Failed to get chain ID:", err);
        }
      }
    };
    getChainId();
  }, [provider]);

  // 네트워크 전환 함수
  const switchNetwork = async (targetChainId: number) => {
    if (!provider) {
      onError("지갑이 연결되지 않았습니다.");
      return;
    }

    try {
      setIsSwitchingNetwork(true);

      const network = NETWORKS[targetChainId];
      if (!network) {
        throw new Error("지원하지 않는 네트워크입니다.");
      }

      // MetaMask에서 네트워크 전환 시도
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.params.chainId }],
      });

      setSelectedNetwork(targetChainId);
    } catch (switchError: unknown) {
      const error = switchError as { code?: number; message?: string };
      // 네트워크가 추가되지 않은 경우
      if (error.code === 4902) {
        try {
          const network = NETWORKS[targetChainId];
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [network.params],
          });
          setSelectedNetwork(targetChainId);
        } catch (addError) {
          onError("네트워크 추가에 실패했습니다.");
          console.error("Add network error:", addError);
        }
      } else {
        onError("네트워크 전환에 실패했습니다.");
        console.error("Switch network error:", switchError);
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!provider || !isConnected) {
      onError("지갑이 연결되지 않았습니다.");
      return;
    }

    setIsPaying(true);
    setStep("paying");

    try {
      // 사용자 주소 가져오기
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const fromAddress = accounts[0];

      // 선택된 네트워크의 지갑 주소 사용
      const targetChainId = selectedNetwork || currentChainId;
      if (!targetChainId) {
        throw new Error("네트워크를 선택해주세요.");
      }

      // 현재 연결된 네트워크 확인
      const currentChainIdHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const currentChainIdDecimal = parseInt(currentChainIdHex, 16);

      // 네트워크가 다르면 전환
      if (currentChainIdDecimal !== targetChainId) {
        await switchNetwork(targetChainId);
      }

      // 보험사 지갑 주소
      const toAddress = getInsuranceWalletAddress(targetChainId);

      // ETH 전송 트랜잭션 파라미터
      const weiValue = parseEther(amount);
      const transactionParameters = {
        from: fromAddress,
        to: toAddress,
        value: `0x${weiValue.toString(16)}`, // ETH를 Wei로 변환 (0x 접두사 필수)
        gas: "0x5208", // 21000 gas (표준 ETH 전송)
      };

      // 트랜잭션 전송
      const hash = (await provider.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })) as string;

      setTxHash(hash);
      console.log("Transaction sent:", hash);

      // 트랜잭션 확인 대기
      await waitForTransaction(hash);

      setStep("success");
      onSuccess();
    } catch (err: unknown) {
      console.error("Direct payment error:", err);
      const error = err as { code?: number; message?: string };
      const message = error.message || "결제 중 오류가 발생했습니다.";
      setErrorMessage(message);
      setStep("error");
      onError(message);
    } finally {
      setIsPaying(false);
    }
  };

  // 트랜잭션 확인 대기
  const waitForTransaction = async (hash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 60; // 최대 60초 대기

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
        return <CreditCard className="w-6 h-6 text-blue-600" />;
      case "paying":
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
        return "직접 결제 준비 완료";
      case "paying":
        return "결제 진행 중...";
      case "success":
        return "결제 완료!";
      case "error":
        return "결제 실패";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "preparation":
        return `${amount} ETH를 직접 전송하여 보험료를 결제합니다.`;
      case "paying":
        return "트랜잭션을 처리하고 있습니다. 지갑에서 승인해주세요.";
      case "success":
        return "보험료가 성공적으로 결제되었습니다.";
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

        {step === "preparation" && (
          <div className="space-y-4">
            {/* 결제 정보 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">결제 정보</h4>

              {/* 네트워크 선택 */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  네트워크 선택:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNetwork(11155111)}
                    disabled={isSwitchingNetwork}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedNetwork === 11155111
                        ? "border-blue-600 bg-blue-100 text-blue-900"
                        : "border-blue-200 hover:border-blue-400"
                    } ${
                      isSwitchingNetwork ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Sepolia (ETH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedNetwork(84532)}
                    disabled={isSwitchingNetwork}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedNetwork === 84532
                        ? "border-blue-600 bg-blue-100 text-blue-900"
                        : "border-blue-200 hover:border-blue-400"
                    } ${
                      isSwitchingNetwork ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Base Sepolia
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-blue-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">보험료:</span>
                  <span className="font-medium">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">선택된 네트워크:</span>
                  <span className="font-medium">
                    {selectedNetwork
                      ? CHAIN_NAMES[selectedNetwork] ||
                        `Chain ${selectedNetwork}`
                      : "확인 중..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">가스비:</span>
                  <span className="font-medium">~0.0001 ETH</span>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                결제 버튼을 클릭하면 지갑에서 트랜잭션 승인을 요청합니다.
                MetaMask 등 지갑 앱에서 확인해주세요.
              </p>
            </div>

            <Button
              onClick={handleDirectPayment}
              disabled={!isConnected || isPaying}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
            >
              {isPaying ? "결제 진행 중..." : `${amount} ETH 결제하기`}
            </Button>
          </div>
        )}

        {step === "paying" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">
                  지갑 승인 대기 중...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-700">
                  트랜잭션 전송 중...
                </span>
              </div>
              {txHash && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600 break-all">
                    Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                결제가 성공적으로 완료되었습니다!
              </span>
            </div>
            {txHash && (
              <p className="text-xs text-green-600 break-all mt-2">
                Transaction: {txHash}
              </p>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">결제에 실패했습니다.</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
