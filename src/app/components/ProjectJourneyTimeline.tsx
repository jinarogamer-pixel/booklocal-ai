"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type ProjectStep = {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: string;
    color: string;
    details: string[];
    image?: string;
};

const projectSteps: ProjectStep[] = [
    {
        id: "consultation",
        title: "Initial Consultation",
        description: "Connect with verified local pros who understand your vision",
        duration: "Day 1-2",
        icon: "🎯",
        color: "#10B981",
        details: [
            "In-depth project assessment",
            "Material preferences discussion",
            "Budget and timeline planning",
            "Site evaluation and measurements"
        ],
        image: "/models/consultation.jpg"
    },
    {
        id: "design",
        title: "Design & Planning",
        description: "Collaborative design process with 3D visualization",
        duration: "Day 3-7",
        icon: "🎨",
        color: "#3B82F6",
        details: [
            "3D room visualization",
            "Material selection with AR preview",
            "Design iterations and refinements",
            "Final approval and specifications"
        ],
        image: "/models/design.jpg"
    },
    {
        id: "preparation",
        title: "Preparation & Sourcing",
        description: "Professional preparation and premium material sourcing",
        duration: "Day 8-14",
        icon: "📦",
        color: "#F59E0B",
        details: [
            "Premium material procurement",
            "Site preparation and protection",
            "Tool and equipment staging",
            "Timeline coordination"
        ],
        image: "/models/preparation.jpg"
    },
    {
        id: "installation",
        title: "Expert Installation",
        description: "Precise installation by certified professionals",
        duration: "Day 15-21",
        icon: "🔨",
        color: "#EF4444",
        details: [
            "Professional installation process",
            "Quality control checkpoints",
            "Real-time progress updates",
            "Safety and cleanliness standards"
        ],
        image: "/models/installation.jpg"
    },
    {
        id: "completion",
        title: "Final Inspection",
        description: "Quality assurance and project handover",
        duration: "Day 22-23",
        icon: "✨",
        color: "#8B5CF6",
        details: [
            "Comprehensive quality inspection",
            "Final walkthrough with client",
            "Care and maintenance guidance",
            "Warranty and support activation"
        ],
        image: "/models/completion.jpg"
    }
];

export default function ProjectJourneyTimeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Timeline progress animation
            gsap.fromTo(
                progressRef.current,
                { height: "0%" },
                {
                    height: "100%",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top center",
                        end: "bottom center",
                        scrub: 1,
                        onUpdate: (self) => {
                            // Update progress indicator
                            const progress = Math.round(self.progress * 100);
                            document.documentElement.style.setProperty("--timeline-progress", `${progress}%`);
                        }
                    }
                }
            );

            // Animate each step
            stepsRef.current.forEach((step, index) => {
                if (!step) return;

                const isEven = index % 2 === 0;

                // Step entrance animation
                gsap.fromTo(
                    step,
                    {
                        opacity: 0,
                        x: isEven ? -100 : 100,
                        scale: 0.8,
                    },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 0.8,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: step,
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );

                // Step highlight animation
                ScrollTrigger.create({
                    trigger: step,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => {
                        gsap.to(step, {
                            scale: 1.05,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    },
                    onLeave: () => {
                        gsap.to(step, {
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    },
                    onEnterBack: () => {
                        gsap.to(step, {
                            scale: 1.05,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to(step, {
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    }
                });

                // Details animation
                const details = step.querySelectorAll(".step-detail");
                gsap.fromTo(
                    details,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: step,
                            start: "top 70%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Floating elements animation
            gsap.to(".floating-element", {
                y: -20,
                rotation: 5,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.5
            });

        }, containerRef);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="floating-element absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl" />
                <div className="floating-element absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-xl" />
                <div className="floating-element absolute bottom-20 right-1/3 w-28 h-28 bg-amber-500/10 rounded-full blur-xl" />
            </div>

            <div ref={containerRef} className="max-w-6xl mx-auto px-6 relative">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-300 text-sm font-medium">Your Project Journey</span>
                    </div>

                    <h2 className="studio-text-gradient text-4xl md:text-5xl font-bold mb-6">
                        From Vision to Reality
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Experience a seamless, professional journey from initial consultation to project completion.
                        Every step is designed for transparency, quality, and your complete satisfaction.
                    </p>
                </div>

                {/* Timeline container */}
                <div className="relative">
                    {/* Progress line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-700 rounded-full">
                        <div
                            ref={progressRef}
                            className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500 rounded-full"
                            style={{ height: "0%" }}
                        />
                    </div>

                    {/* Timeline steps */}
                    <div className="space-y-24">
                        {projectSteps.map((step, index) => {
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={step.id}
                                    ref={(el) => {
                                        if (el) {
                                            stepsRef.current[index] = el;
                                        }
                                    }}
                                    className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                                >
                                    {/* Content card */}
                                    <div className={`flex-1 ${isEven ? 'pr-16' : 'pl-16'}`}>
                                        <div
                                            className="studio-card-glow p-8 relative group"
                                            style={{
                                                borderColor: step.color + "40",
                                                boxShadow: `0 0 30px ${step.color}20`
                                            }}
                                        >
                                            {/* Duration badge */}
                                            <div
                                                className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: step.color + "20",
                                                    color: step.color,
                                                    border: `1px solid ${step.color}40`
                                                }}
                                            >
                                                {step.duration}
                                            </div>

                                            {/* Step content */}
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                                                    style={{ backgroundColor: step.color }}
                                                >
                                                    {step.icon}
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-gray-300 mb-4 leading-relaxed">
                                                        {step.description}
                                                    </p>

                                                    {/* Step details */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {step.details.map((detail, detailIndex) => (
                                                            <div
                                                                key={detailIndex}
                                                                className="step-detail flex items-center gap-2 text-sm text-gray-400"
                                                            >
                                                                <div
                                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: step.color }}
                                                                />
                                                                {detail}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover glow effect */}
                                            <div
                                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                                                style={{
                                                    background: `radial-gradient(circle at center, ${step.color}, transparent 70%)`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Timeline node */}
                                    <div className="relative z-10">
                                        <div
                                            className="w-6 h-6 rounded-full border-4 border-white shadow-lg"
                                            style={{ backgroundColor: step.color }}
                                        >
                                            <div
                                                className="absolute inset-0 rounded-full animate-ping"
                                                style={{ backgroundColor: step.color, opacity: 0.4 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Spacer for opposite side */}
                                    <div className="flex-1" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Call to action */}
                <div className="text-center mt-20">
                    <button
                        className="studio-btn-primary px-8 py-4 text-lg font-semibold"
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent("open-post-project", {
                                detail: { focus: "name" }
                            }));
                        }}
                    >
                        Start Your Project Journey
                    </button>
                    <p className="text-gray-400 text-sm mt-3">
                        Get matched with verified professionals in your area
                    </p>
                </div>
            </div>
        </section>
    );
}
