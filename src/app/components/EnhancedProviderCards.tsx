"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

type Provider = {
    id: string;
    name: string;
    company: string;
    location: string;
    distance: number;
    rating: number;
    reviewCount: number;
    specialties: string[];
    trustScore: number;
    trustFactors: {
        verified: boolean;
        licensed: boolean;
        insured: boolean;
        yearsExperience: number;
        completedProjects: number;
        responseTime: string;
        backgroundCheck: boolean;
    };
    pricing: {
        range: string;
        hourlyRate?: number;
        avgProjectCost: string;
    };
    availability: {
        status: "available" | "busy" | "booked";
        nextAvailable: string;
    };
    portfolio: {
        beforeAfter: string[];
        featuredProject: {
            title: string;
            image: string;
            description: string;
        };
    };
    badges: string[];
    materials: string[];
    avatar: string;
};

const mockProviders: Provider[] = [
    {
        id: "austin-premium-floors",
        name: "Marcus Rodriguez",
        company: "Austin Premium Floors",
        location: "Austin, TX",
        distance: 2.3,
        rating: 4.9,
        reviewCount: 127,
        specialties: ["Hardwood Installation", "Custom Staining", "Floor Restoration"],
        trustScore: 96,
        trustFactors: {
            verified: true,
            licensed: true,
            insured: true,
            yearsExperience: 15,
            completedProjects: 450,
            responseTime: "< 2 hours",
            backgroundCheck: true
        },
        pricing: {
            range: "$$-$$$",
            hourlyRate: 75,
            avgProjectCost: "$8,000-$15,000"
        },
        availability: {
            status: "available",
            nextAvailable: "This week"
        },
        portfolio: {
            beforeAfter: ["/portfolio/austin-1-before.jpg", "/portfolio/austin-1-after.jpg"],
            featuredProject: {
                title: "Modern Oak Kitchen",
                image: "/portfolio/austin-featured.jpg",
                description: "Complete kitchen hardwood installation with custom staining"
            }
        },
        badges: ["Top Rated", "Premium Pro", "Quick Response"],
        materials: ["Oak", "Maple", "Cherry", "Walnut"],
        avatar: "/avatars/marcus-rodriguez.jpg"
    },
    {
        id: "dallas-luxury-tile",
        name: "Sarah Chen",
        company: "Dallas Luxury Tile Co.",
        location: "Dallas, TX",
        distance: 1.8,
        rating: 4.8,
        reviewCount: 89,
        specialties: ["Porcelain Installation", "Natural Stone", "Radiant Heating"],
        trustScore: 94,
        trustFactors: {
            verified: true,
            licensed: true,
            insured: true,
            yearsExperience: 12,
            completedProjects: 320,
            responseTime: "< 4 hours",
            backgroundCheck: true
        },
        pricing: {
            range: "$$$",
            hourlyRate: 85,
            avgProjectCost: "$12,000-$25,000"
        },
        availability: {
            status: "busy",
            nextAvailable: "Next week"
        },
        portfolio: {
            beforeAfter: ["/portfolio/dallas-1-before.jpg", "/portfolio/dallas-1-after.jpg"],
            featuredProject: {
                title: "Luxury Master Bath",
                image: "/portfolio/dallas-featured.jpg",
                description: "Large format porcelain with radiant heating system"
            }
        },
        badges: ["Luxury Specialist", "Certified Installer", "Award Winner"],
        materials: ["Porcelain", "Natural Stone", "Ceramic", "Marble"],
        avatar: "/avatars/sarah-chen.jpg"
    },
    {
        id: "houston-concrete-artisans",
        name: "David Thompson",
        company: "Houston Concrete Artisans",
        location: "Houston, TX",
        distance: 3.1,
        rating: 4.9,
        reviewCount: 156,
        specialties: ["Polished Concrete", "Decorative Finishes", "Industrial Design"],
        trustScore: 98,
        trustFactors: {
            verified: true,
            licensed: true,
            insured: true,
            yearsExperience: 18,
            completedProjects: 380,
            responseTime: "< 1 hour",
            backgroundCheck: true
        },
        pricing: {
            range: "$$",
            hourlyRate: 65,
            avgProjectCost: "$6,000-$18,000"
        },
        availability: {
            status: "available",
            nextAvailable: "Today"
        },
        portfolio: {
            beforeAfter: ["/portfolio/houston-1-before.jpg", "/portfolio/houston-1-after.jpg"],
            featuredProject: {
                title: "Modern Industrial Loft",
                image: "/portfolio/houston-featured.jpg",
                description: "Polished concrete with custom aggregate exposure"
            }
        },
        badges: ["Master Craftsman", "Fast Response", "Eco-Friendly"],
        materials: ["Polished Concrete", "Stained Concrete", "Epoxy", "Microtopping"],
        avatar: "/avatars/david-thompson.jpg"
    }
];

export default function EnhancedProviderCards() {
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Animate cards on load
            gsap.fromTo(
                cardsRef.current,
                { opacity: 0, y: 50, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)"
                }
            );

            // Floating animation for trust meters
            gsap.to(".trust-meter", {
                rotation: 2,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.5
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const getTrustColor = (score: number) => {
        if (score >= 95) return "#22C55E"; // green
        if (score >= 90) return "#3B82F6"; // blue  
        if (score >= 80) return "#F59E0B"; // amber
        return "#EF4444"; // red
    };

    const getAvailabilityColor = (status: string) => {
        switch (status) {
            case "available": return "#22C55E";
            case "busy": return "#F59E0B";
            case "booked": return "#EF4444";
            default: return "#6B7280";
        }
    };

    const openProviderChat = (provider: Provider) => {
        // Trigger PostProjectSheet with provider context
        window.dispatchEvent(new CustomEvent("open-post-project", {
            detail: {
                providerId: provider.id,
                providerName: provider.company,
                focus: "name"
            }
        }));
    };

    const filteredProviders = filter === "all"
        ? mockProviders
        : mockProviders.filter(p =>
            p.materials.some(m => m.toLowerCase().includes(filter.toLowerCase()))
        );

    return (
        <section ref={containerRef} className="py-16 bg-gradient-to-b from-gray-800 to-gray-900">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="studio-text-gradient text-3xl md:text-4xl font-bold mb-4">
                        Verified Local Professionals
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Connect with top-rated providers in your area. Every professional is verified,
                        licensed, and backed by our trust guarantee.
                    </p>
                </div>

                {/* Material filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {["all", "oak", "tile", "concrete"].map((material) => (
                        <button
                            key={material}
                            onClick={() => setFilter(material)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${filter === material
                                    ? "bg-emerald-500 text-white shadow-lg"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                        >
                            {material === "all" ? "All Materials" : `${material} Specialists`}
                        </button>
                    ))}
                </div>

                {/* Provider cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders.map((provider, index) => (
                        <div
                            key={provider.id}
                            ref={(el) => {
                                if (el) {
                                    cardsRef.current[index] = el;
                                }
                            }}
                            className={`studio-card-glow group cursor-pointer transition-all duration-300 hover:scale-102 ${selectedProvider === provider.id ? "ring-2 ring-emerald-500" : ""
                                }`}
                            onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                        >
                            {/* Header with avatar and basic info */}
                            <div className="p-6 pb-4">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-gray-600 overflow-hidden">
                                            <img
                                                src={provider.avatar}
                                                alt={provider.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    img.src = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format&q=80`;
                                                }}
                                            />
                                        </div>
                                        {/* Availability dot */}
                                        <div
                                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800"
                                            style={{ backgroundColor: getAvailabilityColor(provider.availability.status) }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-lg truncate">{provider.name}</h3>
                                        <p className="text-gray-300 font-medium truncate">{provider.company}</p>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                                            <span>📍 {provider.distance}mi away</span>
                                            <span>•</span>
                                            <span>⭐ {provider.rating} ({provider.reviewCount})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Score Meter */}
                                <div className="trust-meter mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-300">Trust Score</span>
                                        <span className="text-lg font-bold" style={{ color: getTrustColor(provider.trustScore) }}>
                                            {provider.trustScore}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${provider.trustScore}%`,
                                                backgroundColor: getTrustColor(provider.trustScore)
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                        {provider.trustFactors.verified && <span>✓ Verified</span>}
                                        {provider.trustFactors.licensed && <span>✓ Licensed</span>}
                                        {provider.trustFactors.insured && <span>✓ Insured</span>}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {provider.badges.slice(0, 2).map((badge, badgeIndex) => (
                                        <span
                                            key={badgeIndex}
                                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-md border border-emerald-500/30"
                                        >
                                            {badge}
                                        </span>
                                    ))}
                                    {provider.badges.length > 2 && (
                                        <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-md">
                                            +{provider.badges.length - 2}
                                        </span>
                                    )}
                                </div>

                                {/* Specialties */}
                                <div className="mb-4">
                                    <div className="text-sm text-gray-400 mb-2">Specialties</div>
                                    <div className="flex flex-wrap gap-1">
                                        {provider.specialties.map((specialty, specIndex) => (
                                            <span
                                                key={specIndex}
                                                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing & Availability */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Pricing Range</div>
                                        <div className="font-semibold text-white">{provider.pricing.range}</div>
                                        <div className="text-xs text-gray-400">{provider.pricing.avgProjectCost}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Availability</div>
                                        <div
                                            className="font-semibold capitalize"
                                            style={{ color: getAvailabilityColor(provider.availability.status) }}
                                        >
                                            {provider.availability.status}
                                        </div>
                                        <div className="text-xs text-gray-400">{provider.availability.nextAvailable}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {selectedProvider === provider.id && (
                                <div className="px-6 pb-6 border-t border-gray-700 pt-4 animate-studio-fade-in">
                                    {/* Trust factors detail */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-white mb-2">Trust Factors</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="text-gray-400">Experience: <span className="text-white">{provider.trustFactors.yearsExperience} years</span></div>
                                            <div className="text-gray-400">Projects: <span className="text-white">{provider.trustFactors.completedProjects}+</span></div>
                                            <div className="text-gray-400">Response: <span className="text-white">{provider.trustFactors.responseTime}</span></div>
                                            <div className="text-gray-400">Background: <span className="text-emerald-300">✓ Cleared</span></div>
                                        </div>
                                    </div>

                                    {/* Featured project */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-white mb-2">Featured Project</h4>
                                        <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                                            <img
                                                src={provider.portfolio.featuredProject.image}
                                                alt={provider.portfolio.featuredProject.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    img.src = `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=200&fit=crop&crop=center&auto=format&q=80`;
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-300 mt-2">{provider.portfolio.featuredProject.description}</p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            className="flex-1 studio-btn-primary py-2 text-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openProviderChat(provider);
                                            }}
                                        >
                                            Get Quote
                                        </button>
                                        <button className="flex-1 studio-btn-ghost py-2 text-sm">
                                            View Portfolio
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 mb-4">
                        Can't find the right professional? We'll help you connect with more verified providers.
                    </p>
                    <button
                        className="studio-btn-secondary px-6 py-3"
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent("open-post-project", {
                                detail: { focus: "notes" }
                            }));
                        }}
                    >
                        Request Custom Matching
                    </button>
                </div>
            </div>
        </section>
    );
}
