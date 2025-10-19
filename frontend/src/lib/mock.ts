import type { Policy, NFT, Stat } from "@/types/insurance"

export const mockStats: Stat[] = [
  { label: "총 지급액", prefix: "₩", value: 1280000000 },
  { label: "총 가입자 수", value: 15420, suffix: "명" },
  { label: "총 예치금액", value: 245.8, suffix: " ETH" },
]

export const mockInsuranceProducts = [
  {
    title: "Basic Shield",
    tier: "Basic" as const,
    description: "기본적인 스마트 컨트랙트 보호를 제공합니다. 소액 자산 보호에 적합합니다.",
    premium: "0.01 ETH / week",
    coverage: "Up to 1 ETH",
  },
  {
    title: "Standard Shield",
    tier: "Standard" as const,
    description: "중급 수준의 보호와 빠른 청구 처리를 제공합니다. 일반 사용자에게 추천합니다.",
    premium: "0.02 ETH / week",
    coverage: "Up to 2 ETH",
  },
  {
    title: "Premium Shield",
    tier: "Premium" as const,
    description: "최고 수준의 보호와 우선 청구 처리를 제공합니다. 대규모 자산 보호에 최적입니다.",
    premium: "0.05 ETH / week",
    coverage: "Up to 5 ETH",
  },
]

export const mockPolicy: Policy = {
  id: "POL-2024-001",
  name: "Standard Shield",
  tier: "Standard",
  premium: "0.02 ETH / week",
  coverage: "Up to 2 ETH",
  startDate: "2024-01-15",
  nextPayment: "2024-02-15",
}

export const mockNFT: NFT = {
  imageUrl: "/insurance-certificate-nft-with-shield-emblem.jpg",
  tokenId: "#1234",
  name: "ShieldFi Insurance Certificate",
  description: "Your decentralized insurance policy certificate",
}
