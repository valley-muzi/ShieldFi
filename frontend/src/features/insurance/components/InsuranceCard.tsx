"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

interface InsuranceCardProps {
  title: string
  tier: "Basic" | "Standard" | "Premium"
  description: string
  premium: string
  coverage: string
  onSubscribe?: () => void
}

const tierColors = {
  Basic: "bg-slate-600 hover:bg-slate-500",
  Standard: "bg-emerald-600 hover:bg-emerald-500",
  Premium: "bg-amber-600 hover:bg-amber-500",
}

export function InsuranceCard({ title, tier, description, premium, coverage, onSubscribe }: InsuranceCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" aria-hidden="true" />
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <Badge className={tierColors[tier]} aria-label={`${tier} tier`}>
          {tier}
        </Badge>
      </div>

      <p className="text-slate-300 text-sm mb-6 flex-grow">{description}</p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">보험료</span>
          <span className="text-white font-semibold">{premium}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">보장 한도</span>
          <span className="text-emerald-400 font-semibold">{coverage}</span>
        </div>
      </div>

      <Button
        onClick={onSubscribe}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
        aria-label={`${title} 가입하기`}
      >
        가입하기
      </Button>
    </Card>
  )
}
