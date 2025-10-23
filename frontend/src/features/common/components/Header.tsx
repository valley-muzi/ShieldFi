"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/common/components/button";
import { Shield } from "lucide-react";

export default function Header() {
  const router = useRouter();

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
        <Shield className="w-8 h-8 text-blue-600" />
        <span className="text-2xl text-foreground">ShieldFi</span>
      </button>
      <Button
        onClick={handleConnectWallet}
        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        Connect Wallet
      </Button>
    </header>
  );
}
