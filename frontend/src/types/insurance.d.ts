export type InsuranceTier = "Basic" | "Standard" | "Premium"

export interface Policy {
  id: string
  name: string
  tier: InsuranceTier
  premium: string
  coverage: string
  startDate?: string
  nextPayment?: string
}

export interface NFT {
  imageUrl: string
  tokenId: string
  name: string
  description: string
}

export interface Stat {
  label: string
  value: number
  prefix?: string
  suffix?: string
}
