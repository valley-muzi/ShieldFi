"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/common/button";
import { Shield } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleConnectWallet = () => {
    // Connect wallet 후 products 페이지로 이동
    router.push("/products");
  };

  return (
    <header className="max-w-7xl mx-auto relative z-10 flex items-center justify-between px-8 py-6 bg-transparent">
      <button
        onClick={handleGoHome}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
      >
        <Shield className="w-8 h-8 text-primary" />
        <span className="text-2xl text-foreground">ShieldFi</span>
      </button>
      <Button
        onClick={handleConnectWallet}
        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-chart-2)] hover:from-[color-mix(in_oklab,var(--color-primary),black_10%)] hover:to-[color-mix(in_oklab,var(--color-chart-2),black_10%)] text-primary-foreground px-6 py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        Connect Wallet
      </Button>
    </header>
  );
}
