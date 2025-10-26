"use client";
import ClaimModal from "@/features/insurance/components/products/ClaimModal";
import PolicyDetailPage from "@/features/insurance/components/products/PolicyDetailPage";
import React, { useState } from "react";

export default function PolicyHistoryPage() {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // 임시 데이터 - 실제로는 API에서 가져올 데이터
  const mockPolicy = {
    id: "POL-1703123456-smart-contract",
    type: "Premium Shield",
    coverage: "5.0 ETH/year",
    premium: "Premium protection insurance product that provides coverage for medium-scale losses.",
    duration: "1 year",
    features: [
      "Medium Scale Loss Coverage",
      "Advanced Protection Features", 
      "Priority Support",
      "Real-time Alerts",
      "Expert Consultation"
    ]
  };

  const handleOpenClaimModal = () => {
    setIsClaimModalOpen(true);
  };

  const handleCloseClaimModal = () => {
    setIsClaimModalOpen(false);
  };

  return (
    <>
      <PolicyDetailPage
        policy={mockPolicy}
        onGoToClaim={handleOpenClaimModal}
        title="My Insurance Policy"
        subtitle="View your active insurance policy details and NFT certificate"
        buttonText="Claim Insurance"
      />

      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={handleCloseClaimModal}
        policy={mockPolicy}
      />
    </>
  );
}
