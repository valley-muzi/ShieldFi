"use client";
import React from "react";
import { Button } from "@/features/common/components/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import PolicyCard from "./PolicyCard";
import NFTCertificate from "./NFTCertificate";
import { useRouter } from "next/navigation";

interface PolicyDetailPageProps {
  policy: {
    id: string;
    type: string;
    coverage: string;
    premium: string;
    duration: string;
  };
  onGoToClaim?: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function PolicyDetailPage({
  policy,
  onGoToClaim,
  title = "Insurance Purchased Successfully!",
  subtitle = "Your policy is now active and your NFT certificate has been minted",
  buttonText = "Home",
}: PolicyDetailPageProps) {
  const router = useRouter();
  const handleGoToHome = () => {
    router.push("/");
  };

  const handleButtonClick = onGoToClaim || handleGoToHome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Main Content */}
      <main className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <h1 className="text-5xl mb-4 text-slate-900">{title}</h1>
            <p className="text-xl text-slate-600">{subtitle}</p>
          </motion.div>

          {/* Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Left Section - Policy Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl mb-6 text-slate-900">
                Policy Information
              </h2>
              <PolicyCard policy={policy} />
            </motion.div>

            {/* Right Section - NFT Certificate */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl mb-6 text-slate-900">NFT Certificate</h2>
              <NFTCertificate policy={policy} />
            </motion.div>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-20"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleButtonClick}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-12 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {buttonText}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
