"use client";
import React from "react";
import { Card } from "@/components/common/card";
import { Calendar, Shield, DollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface PolicyCardProps {
  policy: {
    id: string;
    type: string;
    coverage: string;
    premium: string;
    duration: string;
  };
}

export default function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <Card className="p-8 bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200">
          <div className="text-sm text-slate-600 mb-2">Policy ID</div>
          <div className="text-slate-900 font-mono">{policy.id}</div>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-grow">
              <div className="text-sm text-slate-600 mb-1">Insurance Type</div>
              <div className="text-slate-900">{policy.type}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-grow">
              <div className="text-sm text-slate-600 mb-1">Coverage Amount</div>
              <div className="text-slate-900">{policy.coverage}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex-grow">
              <div className="text-sm text-slate-600 mb-1">Premium</div>
              <div className="text-slate-900">{policy.premium}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-grow">
              <div className="text-sm text-slate-600 mb-1">Duration</div>
              <div className="text-slate-900">{policy.duration}</div>
            </div>
          </motion.div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Active
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
