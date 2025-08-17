"use client";

import { useEffect, useState } from "react";

type CaseStudy = {
    id: string;
    title: string;
    client: string;
    industry: string;
    challenge: string;
    solution: string;
    results: string[];
    metrics: { label: string; value: string; change: string; }[];
    tech: string[];
    image: string;
    gradient: string;
};

const caseStudies: CaseStudy[] = [
    {
        id: "premium-oak-transformation",
        title: "Luxury Oak Transformation",
        client: "Heritage Home Austin",
        industry: "Residential Premium",
        challenge: "Transform a 1920s heritage home with outdated flooring while preserving architectural character and achieving modern luxury standards.",
        solution: "Custom-engineered wide-plank oak flooring with hand-scraped texture, integrated smart home sensors, and precision installation using laser-guided systems.",
        results: [
            "Property value increased by $150,000",
            "Achieved LEED Gold certification",
            "Featured in Architectural Digest",
            "100% client satisfaction with zero callbacks"
        ],
        metrics: [
            { label: "Project Value", value: "$75,000", change: "+25% efficiency" },
            { label: "Completion Time", value: "18 days", change: "-30% vs industry" },
            { label: "Quality Score", value: "99.8%", change: "Industry leading" },
            { label: "ROI", value: "200%", change: "+50% vs expected" }
        ],
        tech: ["3D Laser Scanning", "AI Grain Matching", "IoT Sensors", "AR Visualization"],
        image: "/cases/oak-luxury.jpg",
        gradient: "from-amber-400 via-yellow-500 to-orange-600"
    },
    {
        id: "modern-tile-commercial",
        title: "Corporate Headquarters Renovation",
        client: "TechFlow Industries",
        industry: "Commercial Enterprise",
        challenge: "Renovate 50,000 sq ft of high-traffic corporate space with zero business interruption and demanding durability requirements.",
        solution: "Large-format porcelain tile system with integrated heating, antimicrobial coating, and modular installation allowing phased completion.",
        results: [
            "Zero business disruption during installation",
            "Reduced maintenance costs by 70%",
            "Enhanced employee satisfaction scores",
            "Exceeded all commercial durability standards"
        ],
        metrics: [
            { label: "Project Scale", value: "50,000 sq ft", change: "Largest in region" },
            { label: "Durability Rating", value: "A++", change: "Industry best" },
            { label: "Energy Efficiency", value: "+40%", change: "HVAC savings" },
            { label: "Installation Speed", value: "Record", change: "+200% efficiency" }
        ],
        tech: ["Robotic Installation", "Thermal Mapping", "3D Modeling", "Smart Analytics"],
        image: "/cases/tile-corporate.jpg",
        gradient: "from-blue-400 via-cyan-500 to-teal-600"
    },
    {
        id: "industrial-concrete-loft",
        title: "Luxury Industrial Loft",
        client: "Downtown Developments",
        industry: "High-End Residential",
        challenge: "Convert raw industrial space into luxury living while maintaining authentic industrial character and achieving premium finishes.",
        solution: "Polished concrete with custom metallic aggregates, integrated RGB LED strips, and smart home automation throughout the flooring system.",
        results: [
            "Sold for 40% above market rate",
            "Won 'Design Innovation of the Year'",
            "Featured in 5 major design publications",
            "Became showcase model for development"
        ],
        metrics: [
            { label: "Sale Premium", value: "+40%", change: "Above market" },
            { label: "Design Awards", value: "5", change: "Industry recognition" },
            { label: "Media Features", value: "12", change: "Publications" },
            { label: "Innovation Score", value: "10/10", change: "Perfect rating" }
        ],
        tech: ["Smart Lighting", "Metallic Inlays", "Custom Aggregates", "IoT Integration"],
        image: "/cases/concrete-loft.jpg",
        gradient: "from-gray-400 via-slate-500 to-zinc-600"
    }
];

export default function PremiumCaseStudies() {
    const [activeCase, setActiveCase] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const currentCase = caseStudies[activeCase];

    return (
        <section className="relative py-32 px-6 overflow-hidden">
            {/* Advanced background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900" />
                <div className={`absolute inset-0 bg-gradient-to-r opacity-20 transition-all duration-1000 ${currentCase.gradient}`} />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
            </div>

            <div className="container-premium relative">
                {/* Header */}
                <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                    <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 glass-ultra rounded-2xl">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-blue-300 font-semibold tracking-wide">Enterprise Case Studies</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black mb-8 text-gradient-premium">
                        Proven Excellence
                        <br />
                        <span className="text-gradient-rainbow">At Scale</span>
                    </h2>

                    <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Real projects, measurable results, industry recognition. Discover how our advanced
                        methodology delivers exceptional outcomes for discerning clients.
                    </p>
                </div>

                {/* Case study selector */}
                <div className={`flex flex-wrap justify-center gap-4 mb-16 transform transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                    {caseStudies.map((study, index) => (
                        <button
                            key={study.id}
                            onClick={() => setActiveCase(index)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 ${index === activeCase
                                    ? "glass-ultra text-white shadow-2xl scale-105"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                                }`}
                        >
                            {study.title}
                        </button>
                    ))}
                </div>

                {/* Main case study */}
                <div className={`transform transition-all duration-800 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Visual */}
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass-card relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent z-10" />
                                <img
                                    src={currentCase.image}
                                    alt={currentCase.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.src = `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop&crop=center&auto=format&q=80`;
                                    }}
                                />
                                <div className="absolute bottom-6 left-6 z-20">
                                    <div className="glass-ultra rounded-xl px-4 py-2">
                                        <div className="text-white font-bold">{currentCase.client}</div>
                                        <div className="text-gray-300 text-sm">{currentCase.industry}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics grid */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {currentCase.metrics.map((metric, index) => (
                                    <div key={index} className="card-premium text-center hover-lift">
                                        <div className="text-2xl font-black text-white mb-1">{metric.value}</div>
                                        <div className="text-gray-400 text-xs mb-2">{metric.label}</div>
                                        <div className="text-emerald-400 text-xs font-semibold">{metric.change}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-8">
                            {/* Header */}
                            <div>
                                <h3 className="text-3xl font-black text-white mb-4">{currentCase.title}</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="glass-card px-3 py-1 rounded-lg text-sm text-gray-300">
                                        {currentCase.client}
                                    </span>
                                    <span className="glass-card px-3 py-1 rounded-lg text-sm text-gray-300">
                                        {currentCase.industry}
                                    </span>
                                </div>
                            </div>

                            {/* Challenge */}
                            <div className="card-premium">
                                <h4 className="font-bold text-red-300 mb-3 flex items-center gap-2">
                                    🎯 Challenge
                                </h4>
                                <p className="text-gray-300 leading-relaxed">{currentCase.challenge}</p>
                            </div>

                            {/* Solution */}
                            <div className="card-premium">
                                <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                                    ⚡ Solution
                                </h4>
                                <p className="text-gray-300 leading-relaxed mb-4">{currentCase.solution}</p>

                                {/* Tech stack */}
                                <div className="flex flex-wrap gap-2">
                                    {currentCase.tech.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Results */}
                            <div className="card-premium">
                                <h4 className="font-bold text-emerald-300 mb-4 flex items-center gap-2">
                                    🏆 Results
                                </h4>
                                <div className="space-y-3">
                                    {currentCase.results.map((result, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{result}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to action */}
                <div className={`text-center mt-20 transform transition-all duration-1000 delay-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                    <div className="glass-ultra rounded-3xl p-12 max-w-4xl mx-auto">
                        <h3 className="text-3xl font-black text-white mb-6">
                            Ready for Your Success Story?
                        </h3>
                        <p className="text-gray-300 mb-8 text-lg">
                            Join our portfolio of satisfied clients who experienced exceptional results
                            through our proven methodology and cutting-edge approach.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="btn-premium hover-glow">
                                Schedule Consultation
                            </button>
                            <button className="px-8 py-4 glass-card rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300">
                                View Full Portfolio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
