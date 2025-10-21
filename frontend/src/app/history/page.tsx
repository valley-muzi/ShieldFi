"use client";
import React, { useState } from "react";
import PolicyDetailPage from "@/components/products/PolicyDetailPage";
import ClaimModal from "@/components/products/ClaimModal";

export default function PolicyHistoryPage() {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // 임시 데이터 - 실제로는 API에서 가져올 데이터
  const mockPolicy = {
    id: "POL-1703123456-smart-contract",
    type: "Smart Contract Protection",
    coverage: "Up to $500,000",
    premium: "2.5 ETH/year",
    duration: "1 year",
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
        buttonText="File a Claim"
      />

      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={handleCloseClaimModal}
        policy={mockPolicy}
      />
    </>
  );
}
