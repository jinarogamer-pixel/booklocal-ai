"use client";

import { useState } from "react";

type ProjectStep = {
    id: string;
    title: string;
    description: string;
    duration: string;
    icon: string;
    color: string;
    details: string[];
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
    }
];

export default function SimpleProjectTimeline() {
    const [activeStep, setActiveStep] = useState<number | null>(null);

    return (
        <section className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative">
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

                {/* Timeline steps */}
                <div className="space-y-8">
                    {projectSteps.map((step, index) => {
                        const isEven = index % 2 === 0;
                        const isActive = activeStep === index;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'} transition-all duration-500 ${isActive ? 'scale-105' : 'hover:scale-102'}`}
                                onClick={() => setActiveStep(isActive ? null : index)}
                            >
                                {/* Content card */}
                                <div className={`flex-1 ${isEven ? 'pr-16' : 'pl-16'}`}>
                                    <div
                                        className={`studio-card p-8 relative group cursor-pointer transition-all duration-300 ${isActive ? 'ring-2 ring-opacity-50' : ''}`}
                                        style={{
                                            borderColor: step.color + "40",
                                            boxShadow: isActive ? `0 0 30px ${step.color}30` : `0 0 20px ${step.color}20`
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

                                                {/* Step details - show when active */}
                                                {isActive && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-studio-fade-in">
                                                        {step.details.map((detail, detailIndex) => (
                                                            <div
                                                                key={detailIndex}
                                                                className="flex items-center gap-2 text-sm text-gray-400"
                                                            >
                                                                <div
                                                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: step.color }}
                                                                />
                                                                {detail}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline node */}
                                <div className="relative z-10">
                                    <div
                                        className={`w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${isActive ? 'scale-125' : ''}`}
                                        style={{ backgroundColor: step.color }}
                                    >
                                        {isActive && (
                                            <div
                                                className="absolute inset-0 rounded-full animate-ping"
                                                style={{ backgroundColor: step.color, opacity: 0.4 }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Spacer for opposite side */}
                                <div className="flex-1" />
                            </div>
                        );
                    })}
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
