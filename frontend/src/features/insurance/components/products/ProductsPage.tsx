"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/common/components/button";
import { Card } from "@/features/common/components/card";
import { Shield, Check } from "lucide-react";
import { motion } from "framer-motion";
import PaymentModal from "./PaymentModal";

const insuranceProducts = [
  {
    id: "smart-contract",
    name: "Smart Contract Protection",
    description:
      "Comprehensive coverage against smart contract vulnerabilities and exploits",
    coverage: "Up to $500,000",
    premium: "2.5 ETH/year",
    features: [
      "Audit coverage for verified contracts",
      "Exploit protection",
      "Reentrancy attack coverage",
      "Flash loan attack protection",
      "24/7 monitoring",
    ],
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "wallet-security",
    name: "Wallet Security Insurance",
    description:
      "Protection for your crypto wallet against unauthorized access and theft",
    coverage: "Up to $250,000",
    premium: "1.5 ETH/year",
    features: [
      "Private key theft coverage",
      "Phishing attack protection",
      "Unauthorized transaction coverage",
      "Multi-signature wallet support",
      "Hardware wallet coverage",
    ],
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "defi-protocol",
    name: "DeFi Protocol Coverage",
    description:
      "Insurance for DeFi protocol failures, hacks, and impermanent loss",
    coverage: "Up to $1,000,000",
    premium: "5.0 ETH/year",
    features: [
      "Protocol failure coverage",
      "Impermanent loss protection",
      "Oracle manipulation coverage",
      "Governance attack protection",
      "Liquidity pool insurance",
    ],
    color: "from-cyan-500 to-cyan-600",
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePurchase = (product: any) => {
    setSelectedProduct(product);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    // 정책 정보를 URL 파라미터로 전달하여 success 페이지로 이동
    const params = new URLSearchParams({
      id: `POL-${Date.now()}-${selectedProduct.id}`,
      type: selectedProduct.name,
      coverage: selectedProduct.coverage,
      premium: selectedProduct.premium,
      duration: "1 year",
    });

    router.push(`/success?${params.toString()}`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main Content */}
      <main className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl mb-4 text-slate-900">
              Choose Your Protection Plan
            </h1>
            <p className="text-xl text-slate-600">
              Select the insurance product that best fits your needs
            </p>
          </motion.div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[85%] mx-auto">
            {insuranceProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="p-8 bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-6`}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>

                  <h2 className="text-2xl mb-3 text-slate-900">
                    {product.name}
                  </h2>

                  <p className="text-slate-600 mb-6">{product.description}</p>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-t border-b border-slate-200">
                      <span className="text-slate-600">Coverage</span>
                      <span className="text-slate-900">{product.coverage}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Premium</span>
                      <span className="text-teal-600">{product.premium}</span>
                    </div>
                  </div>

                  <div className="mb-8 flex-grow">
                    <h3 className="text-sm text-slate-900 mb-3">
                      Key Features
                    </h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.15 + 0.4 + idx * 0.05,
                          }}
                          className="flex items-start gap-2"
                        >
                          <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handlePurchase(product)}
                      className={`w-full bg-gradient-to-r ${product.color} hover:opacity-90 text-white py-6 rounded-lg transition-all duration-300 cursor-pointer`}
                    >
                      Purchase Insurance
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {selectedProduct && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          product={selectedProduct}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
