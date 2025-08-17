"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type CaseStudy = {
    id: string;
    title: string;
    subtitle: string;
    location: string;
    client: string;
    duration: string;
    budget: string;
    challenge: string;
    solution: string;
    results: string[];
    beforeImage: string;
    afterImage: string;
    materials: string[];
    provider: {
        name: string;
        rating: number;
        specialties: string[];
    };
    stats: {
        sqft: number;
        satisfaction: number;
        timelineMet: boolean;
        budgetMet: boolean;
    };
};

const caseStudies: CaseStudy[] = [
    {
        id: "modern-oak-transformation",
        title: "Modern Oak Transformation",
        subtitle: "From dated to sophisticated in 3 weeks",
        location: "Austin, TX",
        client: "Sarah & Michael K.",
        duration: "21 days",
        budget: "$18,500",
        challenge: "Transform a dated 1990s kitchen with worn laminate flooring into a modern, warm space that would complement new cabinetry and increase home value.",
        solution: "Premium oak hardwood installation with custom staining to match existing elements, featuring wide-plank boards and a matte finish for contemporary appeal.",
        results: [
            "Home value increased by $32,000",
            "Achieved seamless flow with adjacent rooms",
            "100% client satisfaction rating",
            "Featured in local design magazine"
        ],
        beforeImage: "/models/case-oak-before.jpg",
        afterImage: "/models/case-oak-after.jpg",
        materials: ["Premium Oak Hardwood", "Custom Stain", "Eco-friendly Finish"],
        provider: {
            name: "Austin Premium Floors",
            rating: 4.9,
            specialties: ["Hardwood", "Custom Staining", "Kitchen Renovations"]
        },
        stats: {
            sqft: 850,
            satisfaction: 100,
            timelineMet: true,
            budgetMet: true
        }
    },
    {
        id: "luxury-tile-renovation",
        title: "Luxury Tile Renovation",
        subtitle: "European elegance meets Texas style",
        location: "Dallas, TX",
        client: "The Johnson Family",
        duration: "28 days",
        budget: "$24,750",
        challenge: "Create an elegant, durable flooring solution for a high-traffic family home that would withstand daily life while maintaining luxury appeal.",
        solution: "Large-format porcelain tiles with natural stone look, heated flooring system, and precision installation with minimal grout lines for seamless appearance.",
        results: [
            "Reduced maintenance by 70%",
            "Enhanced comfort with radiant heating",
            "Achieved magazine-quality finish",
            "Perfect durability for family lifestyle"
        ],
        beforeImage: "/models/case-tile-before.jpg",
        afterImage: "/models/case-tile-after.jpg",
        materials: ["Large-Format Porcelain", "Radiant Heating", "Premium Grout"],
        provider: {
            name: "Dallas Luxury Tile Co.",
            rating: 4.8,
            specialties: ["Porcelain", "Radiant Heating", "Large Format Installation"]
        },
        stats: {
            sqft: 1200,
            satisfaction: 98,
            timelineMet: true,
            budgetMet: true
        }
    },
    {
        id: "industrial-concrete-loft",
        title: "Industrial Concrete Loft",
        subtitle: "Raw elegance in downtown Houston",
        location: "Houston, TX",
        client: "Alex & Jordan M.",
        duration: "18 days",
        budget: "$15,200",
        challenge: "Transform raw concrete subfloor in new loft into polished, modern surface that embraces industrial aesthetic while providing comfort and durability.",
        solution: "Polished concrete with custom aggregate exposure, sealed with high-performance coating, and designed with integrated lighting channels for dramatic effect.",
        results: [
            "Achieved award-winning design recognition",
            "Zero maintenance requirements first year",
            "Perfect complement to industrial architecture",
            "Increased rental value by 25%"
        ],
        beforeImage: "/models/case-concrete-before.jpg",
        afterImage: "/models/case-concrete-after.jpg",
        materials: ["Polished Concrete", "Custom Aggregates", "High-Performance Sealer"],
        provider: {
            name: "Houston Concrete Artisans",
            rating: 4.9,
            specialties: ["Polished Concrete", "Custom Finishes", "Industrial Design"]
        },
        stats: {
            sqft: 950,
            satisfaction: 100,
            timelineMet: true,
            budgetMet: true
        }
    }
];

export default function CinematicCaseStudies() {
    const [activeCase, setActiveCase] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const beforeImageRef = useRef<HTMLImageElement>(null);
    const afterImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Hero section parallax
            gsap.to(heroRef.current, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });

            // Floating stats animation
            gsap.to(".stat-float", {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.3
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const transitionToCase = (index: number) => {
        if (index === activeCase || isTransitioning) return;

        setIsTransitioning(true);

        // Animate out current case
        gsap.to([beforeImageRef.current, afterImageRef.current], {
            opacity: 0,
            scale: 0.9,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                setActiveCase(index);

                // Animate in new case
                gsap.fromTo(
                    [beforeImageRef.current, afterImageRef.current],
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                        stagger: 0.1,
                        onComplete: () => setIsTransitioning(false)
                    }
                );
            }
        });
    };

    const currentCase = caseStudies[activeCase];
    const materialColors = {
        oak: "#E6D2B5",
        tile: "#CFE4F7",
        concrete: "#D3D6D8"
    };

    const getCaseColor = (caseId: string) => {
        if (caseId.includes("oak")) return materialColors.oak;
        if (caseId.includes("tile")) return materialColors.tile;
        if (caseId.includes("concrete")) return materialColors.concrete;
        return "#10B981";
    };

    const caseColor = getCaseColor(currentCase.id);

    return (
        <section ref={containerRef} className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Hero background */}
            <div ref={heroRef} className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-radial from-emerald-500/20 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-300 text-sm font-medium">Success Stories</span>
                    </div>

                    <h2 className="studio-text-gradient text-4xl md:text-5xl font-bold mb-6">
                        Real Projects, Real Results
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Discover how our verified professionals transform spaces and exceed expectations.
                        Every project tells a story of craftsmanship, innovation, and client satisfaction.
                    </p>
                </div>

                {/* Case study navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {caseStudies.map((study, index) => (
                        <button
                            key={study.id}
                            onClick={() => transitionToCase(index)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${index === activeCase
                                    ? 'bg-white/10 text-white scale-105 shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/8 hover:text-gray-200'
                                }`}
                            disabled={isTransitioning}
                        >
                            {study.title}
                        </button>
                    ))}
                </div>

                {/* Main case study display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
                    {/* Before/After Images */}
                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Before */}
                            <div className="relative group">
                                <div className="absolute -top-3 left-3 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-red-300 text-xs font-semibold z-10">
                                    Before
                                </div>
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                                    <img
                                        ref={beforeImageRef}
                                        src={currentCase.beforeImage}
                                        alt="Before transformation"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center&auto=format&q=80`;
                                        }}
                                    />
                                </div>
                            </div>

                            {/* After */}
                            <div className="relative group">
                                <div className="absolute -top-3 left-3 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-semibold z-10">
                                    After
                                </div>
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                                    <img
                                        ref={afterImageRef}
                                        src={currentCase.afterImage}
                                        alt="After transformation"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            img.src = `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center&auto=format&q=80`;
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project stats */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="stat-float studio-card p-4 text-center">
                                <div className="text-2xl font-bold text-white">{currentCase.stats.sqft}</div>
                                <div className="text-gray-400 text-sm">Square Feet</div>
                            </div>
                            <div className="stat-float studio-card p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-400">{currentCase.stats.satisfaction}%</div>
                                <div className="text-gray-400 text-sm">Satisfaction</div>
                            </div>
                        </div>
                    </div>

                    {/* Case details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-white">{currentCase.title}</h3>
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: caseColor }}
                                />
                            </div>
                            <p className="text-lg text-gray-300 mb-3">{currentCase.subtitle}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span>📍 {currentCase.location}</span>
                                <span>👥 {currentCase.client}</span>
                                <span>⏱️ {currentCase.duration}</span>
                                <span>💰 {currentCase.budget}</span>
                            </div>
                        </div>

                        {/* Challenge & Solution */}
                        <div className="space-y-4">
                            <div className="studio-card p-4">
                                <h4 className="font-semibold text-red-300 mb-2">Challenge</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{currentCase.challenge}</p>
                            </div>

                            <div className="studio-card p-4">
                                <h4 className="font-semibold text-emerald-300 mb-2">Solution</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{currentCase.solution}</p>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="studio-card p-4">
                            <h4 className="font-semibold text-blue-300 mb-3">Results</h4>
                            <div className="space-y-2">
                                {currentCase.results.map((result, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                        {result}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Materials & Provider */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="studio-card p-4">
                                <h4 className="font-semibold text-purple-300 mb-2">Materials</h4>
                                <div className="flex flex-wrap gap-1">
                                    {currentCase.materials.map((material, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 rounded-md bg-white/10 text-xs text-gray-300"
                                        >
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="studio-card p-4">
                                <h4 className="font-semibold text-amber-300 mb-2">Provider</h4>
                                <div className="text-sm">
                                    <div className="font-medium text-white">{currentCase.provider.name}</div>
                                    <div className="text-gray-400">⭐ {currentCase.provider.rating}/5.0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to action */}
                <div className="text-center">
                    <button
                        className="studio-btn-primary px-8 py-4 text-lg font-semibold mr-4"
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent("open-post-project", {
                                detail: { focus: "name" }
                            }));
                        }}
                    >
                        Start Your Transformation
                    </button>
                    <button className="studio-btn-ghost px-8 py-4 text-lg font-semibold">
                        View All Case Studies
                    </button>
                </div>
            </div>
        </section>
    );
}
