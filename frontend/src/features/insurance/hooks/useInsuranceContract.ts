"use client";

import React from "react";
import { useNexus } from "@avail-project/nexus-widgets";
import { parseEther } from "viem";

interface ContractCallProps {
  amount: string; // ETH 단위
  productId: number;
  coverageAmount: string; // ETH 단위 (Wei로 변환될 값)
  onSuccess: (txHash: string) => void;
  onError: (error: string) => void;
}

/**
 * Insurance 컨트랙트 호출 함수
 */
export function useInsuranceContract() {
  const { provider } = useNexus();

  const callApplyPolicy = async ({
    amount,
    productId,
    coverageAmount,
    onSuccess,
    onError,
  }: ContractCallProps) => {
    if (!provider) {
      onError("지갑이 연결되지 않았습니다.");
      return;
    }

    try {
      // 사용자 주소
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const fromAddress = accounts[0];

      // 로컬 컨트랙트 주소
      const INSURANCE_CONTRACT_ADDRESS =
        "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e";

      // Wei로 변환
      const weiValue = parseEther(amount);
      const coverageWei = parseEther(coverageAmount);

      // 컨트랙트 호출 파라미터
      const txParams = {
        from: fromAddress,
        to: INSURANCE_CONTRACT_ADDRESS as `0x${string}`,
        value: `0x${weiValue.toString(16)}`, // ETH 전송
        data: encodeApplyPolicy(productId, coverageWei), // 함수 호출
      };

      // 트랜잭션 전송
      const hash = (await provider.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })) as string;

      onSuccess(hash);
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      const message = error.message || "컨트랙트 호출 중 오류가 발생했습니다.";
      onError(message);
    }
  };

  return { callApplyPolicy };
}

/**
 * applyPolicy 함수의 데이터 인코딩
 * @param productId 상품 ID
 * @param coverageAmount 커버리지 금액 (Wei)
 */
function encodeApplyPolicy(productId: number, coverageAmount: bigint): string {
  // function selector: applyPolicy(uint256,uint256)
  const selector = "0x8f6bc2a7"; // 이 값은 실제 function signature hash의 첫 4바이트

  // productId 인코딩 (uint256)
  const productIdHex = productId.toString(16).padStart(64, "0");

  // coverageAmount 인코딩 (uint256)
  const coverageAmountHex = coverageAmount.toString(16).padStart(64, "0");

  return `${selector}${productIdHex}${coverageAmountHex}`;
}
