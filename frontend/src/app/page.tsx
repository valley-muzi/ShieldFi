"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/common/components/button";
import ParticleBackground from "@/features/common/effects/ParticleBackground";
import StatCard from "@/features/common/components/StatCard";
import { useBlockscoutTokenInfo } from "@/features/nft/hooks/useBlockscoutTokenInfo";

export default function Home() {
  const router = useRouter();

  // NFT 데이터 가져오기
  const {
    holdersCount,
    isLoading: nftLoading,
  } = useBlockscoutTokenInfo({
    contractAddress: "0x54f456b544abfb785694400bcb1d85629b2d437f",
    tokenId: "1",
  });

  const handleViewProducts = () => {
    router.push("/products");
  };

  const handleViewHistory = () => {
    router.push("/history");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="text-center mb-16">
          <h1 className="text-6xl mb-6 text-foreground">
            Decentralized Insurance <br />
            for the Web3 Era
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Protect your digital assets with transparent, trustless insurance
            powered by blockchain technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleViewProducts}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              Browse Insurance Products
            </Button>
            <Button
              onClick={handleViewHistory}
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              My Policy History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12 min-w-0">
          <StatCard
            title="Total Payout Amount"
            endValue={45678900}
            prefix="$"
            chartData={[
              { month: "Jan", value: 15000000 },
              { month: "Feb", value: 22000000 },
              { month: "Mar", value: 28000000 },
              { month: "Apr", value: 35000000 },
              { month: "May", value: 40000000 },
              { month: "Jun", value: 45678900 },
            ]}
            color="#3B82F6"
          />
          <StatCard
            title="Total Policyholders"
            endValue={holdersCount ? parseInt(holdersCount) : 0}
            prefix=""
            chartData={[
              { month: "Jan", value: 4000 },
              { month: "Feb", value: 6000 },
              { month: "Mar", value: 8000 },
              { month: "Apr", value: 10000 },
              { month: "May", value: 11500 },
              { month: "Jun", value: 12567 },
            ]}
            color="#10B981"
            isLoading={nftLoading}
          />
          <StatCard
            title="Total Deposits"
            endValue={128500000}
            prefix="$"
            chartData={[
              { month: "Jan", value: 40000000 },
              { month: "Feb", value: 65000000 },
              { month: "Mar", value: 85000000 },
              { month: "Apr", value: 100000000 },
              { month: "May", value: 115000000 },
              { month: "Jun", value: 128500000 },
            ]}
            color="#F59E0B"
          />
        </div>
      </main>
    </div>
  );
}
