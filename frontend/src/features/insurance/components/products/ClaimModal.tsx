"use client";
import React, { useState } from "react";
import { Button } from "@/features/common/components/button";
import { Input } from "@/features/common/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/features/common/components/dialog";
import { Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: {
    id: string;
    type: string;
    coverage: string;
    premium: string;
    duration: string;
  };
}

export default function ClaimModal({
  isOpen,
  onClose,
  policy,
}: ClaimModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isClaimSubmitted, setIsClaimSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitClaim = async () => {
    if (!searchQuery.trim()) return;

    setIsSubmitting(true);

    // 시뮬레이션: 실제로는 API 호출
    setTimeout(() => {
      setIsSubmitting(false);
      setIsClaimSubmitted(true);
    }, 2000);
  };

  const handleClose = () => {
    setSearchQuery("");
    setIsClaimSubmitted(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleGoHome = () => {
    handleClose();
    window.location.href = "/";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            File Insurance Claim
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {!isClaimSubmitted ? (
            <>
              {/* Policy Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Policy: {policy.type}
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Policy ID:</span>
                    <span className="text-slate-900 font-mono text-sm">
                      {policy.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Coverage:</span>
                    <span className="text-slate-900">{policy.coverage}</span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transaction Hash
                </label>
                <div className="flex gap-4 items-center">
                  <motion.div
                    className="relative flex-grow"
                    whileFocus={{ scale: 1.01 }}
                  >
                    <Input
                      type="text"
                      placeholder="Enter transaction hash..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-4 text-base border-slate-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg shadow-sm"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleSubmitClaim}
                      disabled={!searchQuery.trim() || isSubmitting}
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-4 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Claim"}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Claim Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">
                  Important Information
                </h4>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                      1
                    </span>
                    <span>
                      Ensure you have all necessary documentation including
                      transaction hashes and incident reports
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                      2
                    </span>
                    <span>
                      Claims are typically processed within 7-14 business days
                      after submission
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-medium">
                      3
                    </span>
                    <span>
                      You will receive updates on your claim status via email
                      and on-chain notifications
                    </span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>

              <h3 className="text-3xl mb-4 text-slate-900">
                Claim Submitted Successfully!
              </h3>
              <p className="text-lg text-slate-600 mb-8">
                Your claim has been submitted and is being processed. You will
                receive updates via email.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-green-900 mb-2">
                  Claim Details
                </h4>
                <div className="space-y-2 text-green-800">
                  <div className="flex justify-between">
                    <span>Policy ID:</span>
                    <span className="font-mono text-sm">{policy.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Hash:</span>
                    <span className="font-mono text-sm">{searchQuery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-medium">
                      Under Review
                    </span>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleGoHome}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  Back to Home
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
