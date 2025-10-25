"use client";
import React from "react";
import { Card } from "@/features/common/components/card";
import AnimatedCounter from "@/features/common/components/AnimatedCounter";
import {
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  endValue: number;
  prefix: string;
  chartData: { month: string; value: number }[];
  color: string;
  isLoading?: boolean;
}

export default function StatCard({
  title,
  endValue,
  prefix,
  chartData,
  color,
  isLoading = false,
}: StatCardProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const gradientId = React.useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6 bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 min-w-0 w-full">
        <h3 className="text-sm text-muted-foreground mb-3">{title}</h3>
        <div className="mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-8">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <AnimatedCounter endValue={endValue} prefix={prefix} />
          )}
        </div>
        <div className="h-32 mt-4 min-w-0 min-h-0 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex space-x-1">
                <div className="w-2 h-8 bg-blue-200 rounded animate-pulse"></div>
                <div
                  className="w-2 h-6 bg-blue-200 rounded animate-pulse"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-10 bg-blue-200 rounded animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-7 bg-blue-200 rounded animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className="w-2 h-9 bg-blue-200 rounded animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <div
                  className="w-2 h-5 bg-blue-200 rounded animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>
            </div>
          ) : isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--color-card-foreground)",
                  }}
                  formatter={(value: number) => [
                    prefix + Number(value).toLocaleString(),
                    "Value",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  animationDuration={1500}
                  animationBegin={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
