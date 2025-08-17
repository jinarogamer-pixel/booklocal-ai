"use client";

import { useEffect } from "react";
import CinematicCaseStudies from "../components/CinematicCaseStudies";
import EnhancedProviderCards from "../components/EnhancedProviderCards";
import ProjectJourneyTimeline from "../components/ProjectJourneyTimeline";

export default function Phase2CinematicPage() {
    useEffect(() => {
        // Add some cinematic entrance effects
        document.body.style.background = "linear-gradient(135deg, #0a0c10 0%, #111827 100%)";

        return () => {
            document.body.style.background = "";
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-radial from-emerald-500/20 via-transparent to-transparent animate-pulse" />
                    <div className="floating-element absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="floating-element absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                    <div className="floating-element absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                </div>

                <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
                    <div className="animate-studio-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-8">
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                            <span className="text-emerald-300 font-medium">Phase 2: Cinematic Features</span>
                        </div>

                        <h1 className="studio-text-gradient text-6xl md:text-7xl font-bold mb-8 leading-tight">
                            Experience the
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
                                Future of Home
                            </span>
                            <br />
                            Renovation
                        </h1>

                        <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                            Immerse yourself in a cinematic journey from vision to reality.
                            Experience premium craftsmanship, verified professionals, and transparent processes
                            that transform your space beyond imagination.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                className="studio-btn-primary px-12 py-6 text-xl font-semibold shadow-2xl shadow-emerald-500/25"
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent("open-post-project", {
                                        detail: { focus: "name" }
                                    }));
                                }}
                            >
                                Begin Your Journey
                            </button>
                            <button
                                className="studio-btn-ghost px-12 py-6 text-xl font-semibold"
                                onClick={() => {
                                    document.getElementById("timeline")?.scrollIntoView({
                                        behavior: "smooth"
                                    });
                                }}
                            >
                                Explore Features
                            </button>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="animate-bounce">
                            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">Scroll to explore</p>
                    </div>
                </div>
            </section>

            {/* Project Journey Timeline */}
            <div id="timeline">
                <ProjectJourneyTimeline />
            </div>

            {/* Cinematic Case Studies */}
            <div id="case-studies">
                <CinematicCaseStudies />
            </div>

            {/* Enhanced Provider Cards */}
            <div id="providers">
                <EnhancedProviderCards />
            </div>

            {/* Feature highlights */}
            <section className="py-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="studio-text-gradient text-4xl font-bold mb-6">
                            Phase 2 Features Delivered
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Advanced cinematic experiences powered by GSAP animations and premium UX design
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Project Journey Timeline */}
                        <div className="studio-card-glow p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Project Journey Timeline</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Interactive timeline with GSAP ScrollTrigger animations, progress tracking,
                                and step-by-step project visualization.
                            </p>
                        </div>

                        {/* Cinematic Case Studies */}
                        <div className="studio-card-glow p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🎬</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Cinematic Case Studies</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Before/after transformations with smooth transitions, detailed project metrics,
                                and immersive storytelling.
                            </p>
                        </div>

                        {/* Enhanced Provider Cards */}
                        <div className="studio-card-glow p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">⭐</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Trust Meter Integration</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Advanced provider cards with animated trust scores, detailed credentials,
                                and intelligent matching algorithms.
                            </p>
                        </div>

                        {/* GSAP Animations */}
                        <div className="studio-card-glow p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">✨</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Premium Animations</h3>
                            <p className="text-gray-300 leading-relaxed">
                                GSAP-powered animations with ScrollTrigger, floating elements,
                                and cinematic entrance effects.
                            </p>
                        </div>

                        {/* Material Correlation */}
                        <div className="studio-card-glow p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Material Preferences</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Intelligent material-provider correlation with dynamic filtering
                                and preference-based recommendations.
                            </p>
                        </div>

                        {/* Production Ready */}
                        <div className="studio-card-glow p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Production Ready</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Fully tested components with TypeScript, error handling,
                                responsive design, and accessibility features.
                            </p>
                        </div>
                    </div>

                    {/* Phase 3 preview */}
                    <div className="text-center mt-20">
                        <div className="studio-card-elevated p-8 inline-block">
                            <h3 className="text-2xl font-bold text-white mb-4">Coming Next: Phase 3</h3>
                            <p className="text-gray-300 mb-6">
                                3D Room Visualizer Integration • AI-Powered Search Enhancement • Real-time Chat System
                            </p>
                            <button className="studio-btn-secondary px-6 py-3">
                                View Roadmap
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
