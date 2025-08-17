"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface EnhancedTrustMeterProps {
  score: number;
  provider?: string;
  live?: boolean;
}

export default function EnhancedTrustMeter({ score, provider, live = false }: EnhancedTrustMeterProps) {
  const [currentScore, setCurrentScore] = useState(0);
  const [loading, setLoading] = useState(live);
  
  useEffect(() => {
    if (live && provider) {
      // Simulate fetching live trust score from Supabase
      setLoading(true);
      setTimeout(() => {
        setCurrentScore(score);
        setLoading(false);
      }, 800);
    } else {
      setCurrentScore(score);
    }
  }, [score, live, provider]);

  const clamped = Math.min(100, Math.max(0, currentScore));
  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-green-500";
    if (score >= 60) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-pink-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Fair";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-3 p-4">
        <div className="w-48 h-4 rounded-full bg-neutral-800 overflow-hidden">
          <motion.div
            className="h-4 bg-gradient-to-r from-neutral-600 to-neutral-700"
            animate={{ width: ["20%", "60%", "30%"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="text-sm text-neutral-400 animate-pulse">Loading trust score...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center space-y-3 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        {provider && (
          <div className="text-xs text-neutral-400 mb-1">{provider}</div>
        )}
        <motion.div
          className="w-48 h-4 rounded-full bg-neutral-800 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "12rem" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className={`h-4 bg-gradient-to-r ${getScoreColor(clamped)}`}
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 90, 
              damping: 20,
              delay: 0.3 
            }}
          />
        </motion.div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{clamped}%</div>
        <div className={`text-sm font-medium ${
          clamped >= 80 ? 'text-emerald-400' : 
          clamped >= 60 ? 'text-yellow-400' : 
          'text-red-400'
        }`}>
          {getScoreLabel(clamped)} Trust Score
        </div>
      </div>
      
      {live && (
        <motion.div
          className="flex items-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="text-xs text-green-400">Live</div>
        </motion.div>
      )}
    </motion.div>
  );
}
