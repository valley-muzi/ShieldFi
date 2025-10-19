import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface PolicySummaryProps {
  policyName: string
  tier: string
  premium: string
  coverage: string
  startDate?: string
  nextPayment?: string
}

export function PolicySummary({ policyName, tier, premium, coverage, startDate, nextPayment }: PolicySummaryProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-emerald-400" aria-hidden="true" />
        <h3 className="text-xl font-bold text-white">보험 정보</h3>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-slate-400 text-sm block mb-1">상품명</span>
          <span className="text-white font-semibold">{policyName}</span>
        </div>

        <div>
          <span className="text-slate-400 text-sm block mb-1">등급</span>
          <span className="text-emerald-400 font-semibold">{tier}</span>
        </div>

        <div>
          <span className="text-slate-400 text-sm block mb-1">보험료</span>
          <span className="text-white">{premium}</span>
        </div>

        <div>
          <span className="text-slate-400 text-sm block mb-1">보장 한도</span>
          <span className="text-white">{coverage}</span>
        </div>

        {startDate && (
          <div>
            <span className="text-slate-400 text-sm block mb-1">가입일</span>
            <span className="text-white">{startDate}</span>
          </div>
        )}

        {nextPayment && (
          <div>
            <span className="text-slate-400 text-sm block mb-1">다음 결제일</span>
            <span className="text-white">{nextPayment}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
