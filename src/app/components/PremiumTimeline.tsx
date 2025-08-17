"use client";

import { useEffect, useState } from "react";

type ProjectStep = {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: string;
    gradient: string;
    details: string[];
    metrics: { label: string; value: string; }[];
};

const projectSteps: ProjectStep[] = [
    {
        id: "discovery",
        title: "Discovery & Strategy",
        description: "Deep dive into your vision with AI-powered matching and premium consultation",
        duration: "24-48 hours",
        icon: "🎯",
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        details: [
            "AI-powered contractor matching algorithm",
            "3D space visualization and planning",
            "Premium material selection process",
            "Comprehensive project timeline development"
        ],
        metrics: [
            { label: "Match Accuracy", value: "98%" },
            { label: "Response Time", value: "<2hrs" }
        ]
    },
    {
        id: "design",
        title: "Design & Visualization",
        description: "Professional 3D modeling with photorealistic previews and material exploration",
        duration: "3-5 days",
        icon: "🎨",
        gradient: "from-blue-500 via-indigo-500 to-purple-500",
        details: [
            "Photorealistic 3D room modeling",
            "Interactive material and finish selection",
            "AR preview on your mobile device",
            "Professional design documentation"
        ],
        metrics: [
            { label: "Design Revisions", value: "Unlimited" },
            { label: "3D Accuracy", value: "99.9%" }
        ]
    },
    {
        id: "preparation",
        title: "Precision Preparation",
        description: "Meticulous planning, premium material sourcing, and site preparation",
        duration: "5-7 days",
        icon: "⚙️",
        gradient: "from-purple-500 via-pink-500 to-rose-500",
        details: [
            "Premium material procurement and verification",
            "Advanced site protection systems",
            "Professional-grade equipment staging",
            "Quality assurance checkpoints established"
        ],
        metrics: [
            { label: "Material Quality", value: "A+" },
            { label: "Prep Efficiency", value: "150%" }
        ]
    },
    {
        id: "execution",
        title: "Expert Execution",
        description: "Master craftsmen deliver precision installation with real-time quality monitoring",
        duration: "7-14 days",
        icon: "🔨",
        gradient: "from-amber-500 via-orange-500 to-red-500",
        details: [
            "Certified master craftsmen installation",
            "Real-time progress tracking and updates",
            "Multi-point quality control system",
            "Advanced dust containment and cleanup"
        ],
        metrics: [
            { label: "Precision Level", value: "±0.1mm" },
            { label: "Quality Score", value: "10/10" }
        ]
    },
    {
        id: "completion",
        title: "Perfection & Handover",
        description: "Final inspection, warranty activation, and comprehensive care guidance",
        duration: "1-2 days",
        icon: "✨",
        gradient: "from-teal-500 via-green-500 to-emerald-500",
        details: [
            "White-glove final inspection process",
            "Comprehensive warranty activation",
            "Professional care and maintenance guidance",
            "Lifetime customer support enrollment"
        ],
        metrics: [
            { label: "Satisfaction Rate", value: "100%" },
            { label: "Warranty Period", value: "25 years" }
        ]
    }
];

export default function PremiumTimeline() {
    const [activeStep, setActiveStep] = useState<number | null>(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative py-32 px-6 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="container-premium relative">
                {/* Header */}
                <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                    <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 glass-ultra rounded-2xl">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-300 font-semibold tracking-wide">Premium Process</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black mb-8 text-gradient-premium">
                        Your Journey to
                        <br />
                        <span className="text-gradient-rainbow">Perfection</span>
                    </h2>

                    <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Experience our meticulously crafted 5-phase process, where cutting-edge technology
                        meets master craftsmanship to deliver results that exceed expectations.
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Progress line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full">
                        <div className="w-full h-full bg-gradient-to-b from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-full" />
                        <div
                            className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500 rounded-full transition-all duration-2000 ease-out"
                            style={{
                                height: activeStep !== null ? `${((activeStep + 1) / projectSteps.length) * 100}%` : "0%"
                            }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="space-y-16">
                        {projectSteps.map((step, index) => {
                            const isEven = index % 2 === 0;
                            const isActive = activeStep === index;
                            const isCompleted = activeStep !== null && index <= activeStep;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-12 ${isEven ? "flex-row" : "flex-row-reverse"} transform transition-all duration-700`}
                                    style={{
                                        animationDelay: `${index * 200}ms`,
                                        opacity: isVisible ? 1 : 0,
                                        transform: `translateY(${isVisible ? 0 : 50}px)`
                                    }}
                                >
                                    {/* Content */}
                                    <div className={`flex-1 ${isEven ? "pr-16" : "pl-16"}`}>
                                        <div
                                            className={`card-premium group cursor-pointer transform transition-all duration-500 ${isActive ? "scale-105 border-white/30" : "hover:scale-102"
                                                }`}
                                            onClick={() => setActiveStep(isActive ? null : index)}
                                            style={{
                                                boxShadow: isActive
                                                    ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(16, 185, 129, 0.3)"
                                                    : "0 8px 32px rgba(0, 0, 0, 0.2)"
                                            }}
                                        >
                                            {/* Duration badge */}
                                            <div className={`absolute -top-4 ${isEven ? "left-8" : "right-8"} px-4 py-2 glass-ultra rounded-xl`}>
                                                <span className="text-xs font-bold text-white tracking-wider">{step.duration}</span>
                                            </div>

                                            <div className="flex items-start gap-6">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl bg-gradient-to-r ${step.gradient} transform transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                                    {step.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-gradient-emerald transition-colors">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                                        {step.description}
                                                    </p>

                                                    {/* Metrics */}
                                                    <div className="flex gap-4 mb-6">
                                                        {step.metrics.map((metric, metricIndex) => (
                                                            <div key={metricIndex} className="glass-card px-4 py-2 rounded-xl">
                                                                <div className="text-sm font-bold text-white">{metric.value}</div>
                                                                <div className="text-xs text-gray-400">{metric.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Expandable details */}
                                                    {isActive && (
                                                        <div className="space-y-3 animate-fade-in-up">
                                                            {step.details.map((detail, detailIndex) => (
                                                                <div key={detailIndex} className="flex items-center gap-3 text-gray-300">
                                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.gradient}`} />
                                                                    <span className="text-sm">{detail}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline node */}
                                    <div className="relative z-20 flex-shrink-0">
                                        <div
                                            className={`w-8 h-8 rounded-full border-4 border-white shadow-2xl transition-all duration-500 bg-gradient-to-r ${step.gradient} ${isCompleted ? "scale-125" : "scale-100"
                                                }`}
                                        >
                                            {isCompleted && (
                                                <div
                                                    className="absolute inset-0 rounded-full animate-ping bg-gradient-to-r opacity-40"
                                                    style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className={`text-center mt-20 transform transition-all duration-1000 delay-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                    <button className="btn-premium text-xl px-12 py-6 hover-glow">
                        Begin Your Premium Experience
                    </button>
                    <p className="text-gray-400 mt-4 max-w-md mx-auto">
                        Join thousands of satisfied clients who experienced perfection
                    </p>
                </div>
            </div>
        </section>
    );
}
