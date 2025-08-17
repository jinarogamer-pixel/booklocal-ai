"use client";

import { useState } from "react";

export default function TestStudioPage() {
    const [clicked, setClicked] = useState(false);

    const triggerPostProject = () => {
        // Test the PostProjectSheet component
        window.dispatchEvent(
            new CustomEvent("open-post-project", {
                detail: {
                    finish: "oak",
                    city: "Austin",
                    state: "TX",
                    zip: "78701",
                    focus: "name",
                },
            })
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="studio-text-gradient text-4xl font-bold mb-8">
                    Studio Design System Test
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Button Variants */}
                    <div className="studio-card p-6">
                        <h2 className="text-white text-lg font-semibold mb-4">Buttons</h2>
                        <div className="space-y-3">
                            <button className="studio-btn-primary w-full">Primary Button</button>
                            <button className="studio-btn-secondary w-full">Secondary Button</button>
                            <button className="studio-btn-ghost w-full">Ghost Button</button>
                            <button
                                className="studio-btn-primary w-full"
                                onClick={triggerPostProject}
                            >
                                Open Project Sheet
                            </button>
                        </div>
                    </div>

                    {/* Card Variants */}
                    <div className="space-y-4">
                        <div className="studio-card-glass p-4">
                            <h3 className="text-white font-medium">Glass Card</h3>
                            <p className="text-gray-400 text-sm">With backdrop blur</p>
                        </div>
                        <div className="studio-card-elevated p-4">
                            <h3 className="text-white font-medium">Elevated Card</h3>
                            <p className="text-gray-400 text-sm">With shadow elevation</p>
                        </div>
                        <div className="studio-card-glow p-4">
                            <h3 className="text-white font-medium">Glow Card</h3>
                            <p className="text-gray-400 text-sm">With premium glow</p>
                        </div>
                    </div>

                    {/* Form Elements */}
                    <div className="studio-card p-6">
                        <h2 className="text-white text-lg font-semibold mb-4">Form Elements</h2>
                        <div className="space-y-3">
                            <input
                                className="studio-input"
                                placeholder="Studio Input"
                            />
                            <input
                                className="studio-input"
                                placeholder="Focus to see glow"
                                onFocus={() => setClicked(true)}
                            />
                            <div className="studio-badge studio-badge-success">
                                Success Badge
                            </div>
                        </div>
                    </div>
                </div>

                {/* Material Tints */}
                <div className="studio-card mb-8 p-6">
                    <h2 className="text-white text-lg font-semibold mb-4">Material Tints</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="tint-oak p-4 rounded-lg text-center">
                            <div className="text-white font-medium">Oak Finish</div>
                            <div className="text-gray-300 text-sm">#E6D2B5</div>
                        </div>
                        <div className="tint-tile p-4 rounded-lg text-center">
                            <div className="text-white font-medium">Tile Finish</div>
                            <div className="text-gray-300 text-sm">#CFE4F7</div>
                        </div>
                        <div className="tint-concrete p-4 rounded-lg text-center">
                            <div className="text-white font-medium">Concrete</div>
                            <div className="text-gray-300 text-sm">#D3D6D8</div>
                        </div>
                    </div>
                </div>

                {/* Animations */}
                <div className="studio-card p-6">
                    <h2 className="text-white text-lg font-semibold mb-4">Animations</h2>
                    <div className="space-y-4">
                        <div
                            className={`studio-card-glow p-4 transition-all duration-700 cursor-pointer ${clicked ? 'scale-105 rotate-1' : 'hover:scale-102'
                                }`}
                            onClick={() => setClicked(!clicked)}
                        >
                            <div className="text-white font-medium">Click to animate</div>
                            <div className="text-gray-400 text-sm">Studio easing curves</div>
                        </div>

                        <div className="animate-studio-fade-in-up">
                            <div className="text-white">Fade in up animation</div>
                        </div>
                    </div>
                </div>

                {/* API Test */}
                <div className="studio-card p-6">
                    <h2 className="text-white text-lg font-semibold mb-4">API Test</h2>
                    <button
                        className="studio-btn-secondary"
                        onClick={async () => {
                            try {
                                const response = await fetch("/api/projects/new", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        name: "Test User",
                                        email: "test@example.com",
                                        sqft: 500,
                                        finish: "oak"
                                    })
                                });
                                const result = await response.json();
                                alert(JSON.stringify(result, null, 2));
                            } catch (error) {
                                alert("API Error: " + String(error));
                            }
                        }}
                    >
                        Test API Endpoint
                    </button>
                </div>
            </div>
        </div>
    );
}
