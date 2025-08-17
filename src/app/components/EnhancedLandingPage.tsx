"use client";
import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import TypewriterHeadline from "./TypewriterHeadline";
import EnhancedTrustMeter from "./EnhancedTrustMeter";
import PostProjectSheet from "./PostProjectSheet";

// Lazy load heavy 3D and GSAP components
const RoomViewer = dynamic(() => import("./RoomViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-neutral-950 rounded-lg flex items-center justify-center border border-neutral-800">
      <div className="text-neutral-400 animate-pulse">Loading 3D Room...</div>
    </div>
  )
});

const ScrollStorytellingSection = dynamic(() => import("./ScrollStorytellingSection"), {
  ssr: false,
  loading: () => (
    <section className="py-20 bg-neutral-900">
      <div className="text-center text-neutral-400">Loading story section...</div>
    </section>
  )
});

export default function EnhancedLandingPage() {
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [estimate, setEstimate] = useState<{
    estimate?: number;
    timeline?: { estimated_weeks: number };
    cost_breakdown?: { cost_per_sqft: number };
  } | null>(null);

  const headlineSteps = [
    "Book local professionals instantly",
    "Transform your space with confidence", 
    "Get AI-powered project estimates",
    "See your vision in 3D"
  ];

  const handleGetEstimate = async () => {
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sqft: 1200,
          material: 'hardwood',
          location: 'San Francisco',
          category: 'flooring'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      }
    } catch (error) {
      console.error('Failed to get estimate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-neutral-950 to-green-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Headline */}
          <TypewriterHeadline 
            steps={headlineSteps} 
            className="mb-16"
          />

          {/* 3D Room Viewer */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Suspense fallback={
              <div className="h-[400px] w-full bg-neutral-950 rounded-lg flex items-center justify-center border border-neutral-800">
                <div className="text-neutral-400">Loading 3D Experience...</div>
              </div>
            }>
              <RoomViewer />
            </Suspense>
          </motion.div>

          {/* Trust Meters */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <EnhancedTrustMeter score={94} provider="Elite Contractors" live={true} />
            <EnhancedTrustMeter score={87} provider="Home Pros+" />
            <EnhancedTrustMeter score={91} provider="Trusted Builders" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <button
              onClick={() => setIsProjectSheetOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-green-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Post Your Project
            </button>
            
            <button
              onClick={handleGetEstimate}
              className="px-8 py-4 bg-neutral-800 border border-neutral-700 text-white font-medium rounded-xl hover:bg-neutral-700 transition-all duration-300"
            >
              Get Instant Estimate
            </button>
          </motion.div>

          {/* Estimate Display */}
          {estimate && (
            <motion.div
              className="mt-8 p-6 bg-neutral-900/80 backdrop-blur-sm rounded-xl border border-neutral-800 max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="font-semibold text-lg mb-3">Project Estimate</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Cost:</span>
                  <span className="font-medium">${estimate.estimate?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Timeline:</span>
                  <span>{estimate.timeline?.estimated_weeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Per Sq Ft:</span>
                  <span>${estimate.cost_breakdown?.cost_per_sqft}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Storytelling Section with ScrollTrigger */}
      <Suspense fallback={
        <section className="py-20 bg-neutral-900">
          <div className="text-center text-neutral-400">Loading story section...</div>
        </section>
      }>
        <ScrollStorytellingSection />
      </Suspense>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-neutral-900 to-neutral-800">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            className="grid md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <div className="text-4xl font-bold text-sky-400 mb-2">50K+</div>
              <div className="text-neutral-300">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">98%</div>
              <div className="text-neutral-300">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">24h</div>
              <div className="text-neutral-300">Average Response Time</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-neutral-950">
        <motion.div
          className="text-center max-w-2xl mx-auto px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-neutral-400 mb-8">
            Join thousands of homeowners who trust BookLocal for their projects
          </p>
          <button
            onClick={() => setIsProjectSheetOpen(true)}
            className="px-12 py-4 bg-gradient-to-r from-sky-500 to-green-500 text-white font-semibold text-lg rounded-xl hover:from-sky-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started Now
          </button>
        </motion.div>
      </section>

      {/* Project Submission Sheet */}
      <PostProjectSheet 
        isOpen={isProjectSheetOpen}
        onClose={() => setIsProjectSheetOpen(false)}
      />
    </div>
  );
}
