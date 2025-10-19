"use client"

import { ClaimInput } from "@/features/claim/components/ClaimInput"
import { PolicySummary } from "@/features/insurance/components/PolicySummary"
import { NFTPreview } from "@/features/common/components/NFTPreview"
import { WalletButton } from "@/features/wallet/components/WalletButton"
import { mockPolicy, mockNFT } from "@/lib/mock"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ClaimPage() {
  const router = useRouter()
  const [walletConnected, setWalletConnected] = useState(true)

  const handleClaimSubmit = (text: string) => {
    console.log("[v0] Claim submitted:", text)
    router.push("/claim/success")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-400" aria-hidden="true" />
            <span className="text-2xl font-bold text-white">ShieldFi</span>
          </Link>
          <WalletButton connected={walletConnected} onClick={() => setWalletConnected(!walletConnected)} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-12 text-center">보험금 청구</h1>

          <div className="mb-12">
            <ClaimInput onSubmit={handleClaimSubmit} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PolicySummary {...mockPolicy} policyName={mockPolicy.name} />
            <NFTPreview {...mockNFT} />
          </div>
        </div>
      </main>
    </div>
  )
}
