"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"

interface NFTPreviewProps {
  imageUrl: string
  tokenId?: string
  name?: string
  description?: string
}

export function NFTPreview({ imageUrl, tokenId, name, description }: NFTPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-900">
          {isLoading && <div className="absolute inset-0 animate-pulse bg-slate-700" />}
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name || "NFT Certificate"}
            fill
            className="object-cover"
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
        </div>

        {tokenId && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Token ID</span>
            <span className="text-emerald-400 font-mono">{tokenId}</span>
          </div>
        )}

        {name && <h3 className="text-lg font-semibold text-white">{name}</h3>}

        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
    </Card>
  )
}
