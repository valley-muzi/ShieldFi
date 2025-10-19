"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface Stat {
  label: string
  value: number
  prefix?: string
  suffix?: string
}

interface StatsTickerProps {
  items: Stat[]
  durationMs?: number
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.floor(num))
}

function CountUpNumber({
  target,
  duration,
  prefix = "",
  suffix = "",
}: {
  target: number
  duration: number
  prefix?: string
  suffix?: string
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCurrent(target * easeOutQuart)

      if (now < endTime) {
        requestAnimationFrame(animate)
      } else {
        setCurrent(target)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration])

  return (
    <span className="text-3xl md:text-4xl font-bold text-emerald-400">
      {prefix}
      {formatNumber(current)}
      {suffix}
    </span>
  )
}

export function StatsTicker({ items, durationMs = 1000 }: StatsTickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      {items.map((stat, index) => (
        <Card
          key={index}
          className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 text-center hover:bg-slate-800/70 transition-colors"
        >
          <div className="space-y-2">
            <CountUpNumber target={stat.value} duration={durationMs} prefix={stat.prefix} suffix={stat.suffix} />
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
