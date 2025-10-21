"use client";
import React, { useState } from "react";
import { Card } from "@/components/common/card";
import { Shield, Award } from "lucide-react";
import { motion } from "framer-motion";

interface NFTCertificateProps {
  policy: {
    id: string;
    type: string;
    coverage: string;
    premium: string;
    duration: string;
  };
}

export default function NFTCertificate({ policy }: NFTCertificateProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative h-full" onClick={handleClick}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side - NFT Image */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="p-8 bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-2xl text-white overflow-hidden relative hover:shadow-3xl transition-shadow duration-300 h-full flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              {/* NFT Image Placeholder */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              >
                <div>nft image</div>
              </motion.div>

              <div className="text-xs text-purple-200">
                Token ID: {policy.id}
              </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full" />
          </Card>
        </div>

        {/* Back Side - Certificate Details */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Card className="p-8 bg-gradient-to-br from-teal-600 to-blue-600 border-0 shadow-2xl text-white overflow-hidden relative hover:shadow-3xl transition-shadow duration-300 h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Shield className="w-8 h-8" />
                  </motion.div>
                  <span className="text-xl">ShieldFi</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Award className="w-8 h-8" />
                </motion.div>
              </motion.div>

              {/* Certificate Title */}
              <div className="text-center mb-8">
                <h3 className="text-3xl mb-2">Insurance Certificate</h3>
                <p className="text-teal-100 text-sm">
                  NFT-Based Proof of Coverage
                </p>
              </div>

              {/* Certificate Details */}
              <div className="space-y-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <div className="text-teal-100 text-sm mb-1">Token ID</div>
                  <div className="font-mono text-sm">{policy.id}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <div className="text-teal-100 text-sm mb-1">Policy Type</div>
                  <div className="text-lg">{policy.type}</div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  >
                    <div className="text-teal-100 text-sm mb-1">Coverage</div>
                    <div>{policy.coverage}</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  >
                    <div className="text-teal-100 text-sm mb-1">Duration</div>
                    <div>{policy.duration}</div>
                  </motion.div>
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="border-t border-white/20 pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-100">
                    Issued: {new Date().toLocaleDateString()}
                  </span>
                  <span className="text-teal-100">Blockchain Verified ✓</span>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-full" />
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
