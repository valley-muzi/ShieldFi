"use client"

import { StatsTicker } from "@/features/common/components/StatsTicker"
import { WalletButton } from "@/features/wallet/components/WalletButton"
import { mockStats } from "@/lib/mock"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [walletConnected, setWalletConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-400" aria-hidden="true" />
            <span className="text-2xl font-bold text-white">ShieldFi</span>
          </div>
          <WalletButton connected={walletConnected} onClick={() => setWalletConnected(!walletConnected)} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold text-white mb-4 text-balance">
            ShieldFi – 탈중앙 보험
          </h1>
          <p className="text-xl text-slate-400 mb-8 text-pretty">스마트 컨트랙트로 보호받는 안전한 디지털 자산</p>
          <Link href="/insurance">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white text-lg px-8">
              보험 상품 보기
            </Button>
          </Link>
        </section>

        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            플랫폼 통계
          </h2>
          <StatsTicker items={mockStats} />
        </section>
      </main>
    </div>
  )
}
