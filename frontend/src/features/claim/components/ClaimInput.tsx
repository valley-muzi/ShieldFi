"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useState, type KeyboardEvent } from "react"

interface ClaimInputProps {
  placeholder?: string
  onSubmit?: (text: string) => void
  defaultValue?: string
}

export function ClaimInput({
  placeholder = "청구 사유를 입력하세요...",
  onSubmit,
  defaultValue = "",
}: ClaimInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 w-full max-w-4xl mx-auto">
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
            aria-label="청구 사유 입력"
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6"
          aria-label="청구 제출"
        >
          청구
        </Button>
      </div>
    </Card>
  )
}
