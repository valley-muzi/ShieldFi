"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface WalletButtonProps {
  connected?: boolean
  addressShort?: string
  onClick?: () => void
}

export function WalletButton({ connected = false, addressShort = "0x12...89af", onClick }: WalletButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
      aria-label={connected ? `Connected: ${addressShort}` : "Connect Wallet"}
    >
      <Wallet className="w-4 h-4" aria-hidden="true" />
      {connected ? `Connected: ${addressShort}` : "Connect Wallet"}
    </Button>
  )
}
