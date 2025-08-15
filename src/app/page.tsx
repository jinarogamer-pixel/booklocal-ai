"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with better error handling
const PremiumLandingPage = dynamic(() => import('@/components/PremiumLandingPage').catch(() => {
  // Fallback if premium component fails
  const FallbackComponent = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">BookLocal</h1>
        <p className="text-gray-300">Loading platform...</p>
      </div>
    </div>
  );
  FallbackComponent.displayName = 'FallbackComponent';
  return { default: FallbackComponent };
}), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading BookLocal...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <PremiumLandingPage />;
}
