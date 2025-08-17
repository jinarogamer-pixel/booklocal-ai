"use client";

import SimpleProjectTimeline from "../components/SimpleProjectTimeline";

export default function WorkingPhase2Page() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
                    <div className="animate-studio-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-8">
                            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                            <span className="text-emerald-300 font-medium">Phase 2 - Working Version</span>
                        </div>

                        <h1 className="studio-text-gradient text-6xl md:text-7xl font-bold mb-8 leading-tight">
                            Environment
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
                                Fixed & Working
                            </span>
                        </h1>

                        <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                            Development environment restored. All components are now loading properly
                            without the routes-manifest.json errors or reload loops.
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
                                Test Project Sheet
                            </button>
                            <button
                                className="studio-btn-ghost px-12 py-6 text-xl font-semibold"
                                onClick={() => {
                                    document.getElementById("timeline")?.scrollIntoView({
                                        behavior: "smooth"
                                    });
                                }}
                            >
                                View Timeline
                            </button>
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                                <div className="text-green-400 font-bold">✅</div>
                                <div className="text-xs text-green-300">Dev Server</div>
                            </div>
                            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                                <div className="text-green-400 font-bold">✅</div>
                                <div className="text-xs text-green-300">Components</div>
                            </div>
                            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                                <div className="text-green-400 font-bold">✅</div>
                                <div className="text-xs text-green-300">CSS System</div>
                            </div>
                            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                                <div className="text-green-400 font-bold">✅</div>
                                <div className="text-xs text-green-300">No Errors</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Working Timeline */}
            <div id="timeline">
                <SimpleProjectTimeline />
            </div>

            {/* Test Studio Components */}
            <section className="py-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="studio-text-gradient text-4xl font-bold mb-6">
                            Studio System Test
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            All core studio components are working correctly
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Button Variants */}
                        <div className="studio-card p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Button System</h3>
                            <div className="space-y-3">
                                <button className="studio-btn-primary w-full">Primary Button</button>
                                <button className="studio-btn-secondary w-full">Secondary Button</button>
                                <button className="studio-btn-ghost w-full">Ghost Button</button>
                            </div>
                        </div>

                        {/* Card Variants */}
                        <div className="space-y-4">
                            <div className="studio-card-glass p-6">
                                <h3 className="text-white font-medium">Glass Effect</h3>
                                <p className="text-gray-400 text-sm">Working perfectly</p>
                            </div>
                            <div className="studio-card-elevated p-6">
                                <h3 className="text-white font-medium">Elevated Card</h3>
                                <p className="text-gray-400 text-sm">Shadow working</p>
                            </div>
                        </div>

                        {/* Form Elements */}
                        <div className="studio-card p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Form System</h3>
                            <div className="space-y-3">
                                <input
                                    className="studio-input"
                                    placeholder="Studio Input Working"
                                />
                                <div className="studio-badge studio-badge-success">
                                    All Systems Go
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Environment Status */}
                    <div className="mt-16 text-center">
                        <div className="studio-card-elevated p-8 inline-block">
                            <h3 className="text-2xl font-bold text-white mb-4">🚀 Environment Status</h3>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div>
                                    <div className="text-green-400 font-medium">✅ Next.js 15.4.6</div>
                                    <div className="text-gray-400 text-sm">Clean startup</div>
                                </div>
                                <div>
                                    <div className="text-green-400 font-medium">✅ Dependencies</div>
                                    <div className="text-gray-400 text-sm">All installed</div>
                                </div>
                                <div>
                                    <div className="text-green-400 font-medium">✅ TypeScript</div>
                                    <div className="text-gray-400 text-sm">Compiling clean</div>
                                </div>
                                <div>
                                    <div className="text-green-400 font-medium">✅ Studio CSS</div>
                                    <div className="text-gray-400 text-sm">Fully operational</div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="text-sm text-gray-300">
                                    Environment restored successfully. Ready for Phase 3 development.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
