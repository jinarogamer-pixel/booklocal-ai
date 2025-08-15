"use client";
import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">BookLocal Test Page</h1>
        <p className="text-white text-xl">Testing basic functionality...</p>
        <div className="mt-8">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl transition-all">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}
