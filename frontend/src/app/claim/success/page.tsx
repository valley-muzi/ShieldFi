"use client"

import { WalletButton } from "@/features/wallet/components/WalletButton"
import { Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ClaimSuccessPage() {
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
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" aria-hidden="true" />

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">보험금 청구 요청이 완료되었습니다</h1>

          <p className="text-lg text-slate-400 mb-8">청구 내역을 검토 중입니다. 승인되면 자동으로 지급됩니다.</p>

          <Link href="/">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8">
              홈으로 이동
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
