/**
 * 보험 결제 관련 상수
 */

// 보험사 지갑 주소 (결제를 받을 주소)
export const INSURANCE_WALLET_ADDRESSES = {
  // Ethereum Mainnet
  1: "0x2784177671da5525461296a2f170009339e92dc2",
  // Ethereum Sepolia (테스트넷)
  11155111: "0x2784177671da5525461296a2f170009339e92dc2",
  // Base Mainnet
  8453: "0x2784177671da5525461296a2f170009339e92dc2",
  // Base Sepolia (테스트넷)
  84532: "0x2784177671da5525461296a2f170009339e92dc2",
} as const;

// 지원하는 체인 ID 타입
export type SupportedChainId = keyof typeof INSURANCE_WALLET_ADDRESSES;

/**
 * 체인 ID에 따른 보험사 지갑 주소 반환
 */
export function getInsuranceWalletAddress(chainId: number): string {
  return (
    INSURANCE_WALLET_ADDRESSES[chainId as SupportedChainId] ||
    INSURANCE_WALLET_ADDRESSES[1]
  );
}

/**
 * 체인 이름 매핑
 */
export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  11155111: "Ethereum Sepolia",
  8453: "Base",
  84532: "Base Sepolia",
} as const;
