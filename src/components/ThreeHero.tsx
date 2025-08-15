"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ThreeHeroCanvas = dynamic(() => import("./ThreeHeroCanvas"), { ssr: false });

export default function ThreeHero({ onStep }: { onStep: (s: number) => void }) {
  const [reduced, setReduced] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);
  }, []);
  
  return (
    <div className="relative w-full max-w-6xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fallback gradient for when 3D is loading */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />
      
      {/* Video fallback - optional */}
      {reduced && (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          autoPlay loop muted playsInline aria-hidden
        >
          <source src="/hero-fallback.mp4" type="video/mp4" />
        </video>
      )}
      
      {/* 3D Canvas */}
      {!reduced && <ThreeHeroCanvas onStep={onStep} />}
      
      {/* Soft vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,.55))]" />
    </div>
  );
}
