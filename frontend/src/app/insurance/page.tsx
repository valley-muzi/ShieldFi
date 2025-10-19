"use client"

import { InsuranceCard } from "@/features/insurance/components/InsuranceCard"
import { WalletButton } from "@/features/wallet/components/WalletButton"
import { mockInsuranceProducts } from "@/lib/mock"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function InsurancePage() {
  const router = useRouter()
  const [walletConnected, setWalletConnected] = useState(false)

  const handleSubscribe = (title: string) => {
    console.log("[v0] Subscribe clicked for:", title)
    router.push("/success")
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">보험 상품</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {mockInsuranceProducts.map((product) => (
            <InsuranceCard key={product.title} {...product} onSubscribe={() => handleSubscribe(product.title)} />
          ))}
        </div>
      </main>
    </div>
  )
}
