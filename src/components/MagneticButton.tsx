"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function MagneticButton({ children, className = "", onClick, disabled }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-30, 30], [8, -8]);
  const rotateY = useTransform(x, [-30, 30], [-8, 8]);

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(Math.max(-30, Math.min(30, relX)));
    y.set(Math.max(-30, Math.min(30, relY)));
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x, y, rotateX, rotateY }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl px-8 py-4 font-semibold bg-gradient-to-r from-sky-500 via-purple-500 to-cyan-500 text-white shadow-[0_10px_30px_rgba(79,70,229,.35)] transition-all ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-sky-600 via-purple-600 to-cyan-600" />
    </motion.button>
  );
}
