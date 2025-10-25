"use client";
import React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";

interface AnimatedCounterProps {
  endValue: number;
  prefix?: string;
  durationMs?: number;
}

export default function AnimatedCounter({
  endValue,
  prefix = "",
  durationMs = 1200,
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 120, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  React.useEffect(() => {
    const controls = animate(0, endValue, {
      duration: durationMs / 1000,
      onUpdate: (latest) => count.set(latest),
      ease: "easeOut",
    });
    return controls.stop;
  }, [endValue, durationMs, count]);

  return (
    <motion.div className="text-3xl font-semibold text-slate-900">
      {prefix}
      <motion.span>{rounded}</motion.span>
    </motion.div>
  );
}
