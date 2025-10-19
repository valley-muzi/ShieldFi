"use client"

import { PolicySummary } from "@/features/insurance/components/PolicySummary"
import { NFTPreview } from "@/features/common/components/NFTPreview"
import { WalletButton } from "@/features/wallet/components/WalletButton"
import { mockPolicy, mockNFT } from "@/lib/mock"
import { Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SuccessPage() {
  const [walletConnected, setWalletConnected] = useState(true)

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
          <div className="text-center mb-12">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-4xl font-bold text-white mb-2">가입이 완료되었습니다</h1>
            <p className="text-slate-400">보험 증서 NFT가 발급되었습니다</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PolicySummary {...mockPolicy} policyName={mockPolicy.name} />
            <NFTPreview {...mockNFT} />
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 bg-transparent">
                홈으로 이동
              </Button>
            </Link>
            <Link href="/claim">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">보험금 청구하기</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
