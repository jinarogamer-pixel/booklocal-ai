"usimport PremiumTimeline from '../components/PremiumTimeline';
import PremiumCaseStudies from '../components/PremiumCaseStudies';

export default function PremiumShowcasePage() {lient";

    import { useEffect, useRef, useState } from "react";
    import PremiumTimeline from "../components/PremiumTimeline";

    export default function PremiumShowcasePage() {
        const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
        const [isLoaded, setIsLoaded] = useState(false);
        const heroRef = useRef<HTMLElement>(null);

        useEffect(() => {
            setIsLoaded(true);

            const handleMouseMove = (e: MouseEvent) => {
                setMousePosition({
                    x: (e.clientX / window.innerWidth) * 100,
                    y: (e.clientY / window.innerHeight) * 100,
                });
            };

            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
        }, []);

        return (
            <div className="relative min-h-screen overflow-hidden">
                {/* Dynamic background with mouse tracking */}
                <div
                    className="fixed inset-0 transition-all duration-1000 ease-out"
                    style={{
                        background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(16, 185, 129, 0.15) 0%, 
              rgba(59, 130, 246, 0.1) 25%, 
              rgba(139, 92, 246, 0.08) 50%, 
              transparent 70%
            ),
            linear-gradient(135deg, 
              #0a0c10 0%, 
              #111827 25%, 
              #1f2937 50%, 
              #111827 75%, 
              #0a0c10 100%
            )
          `
                    }}
                />

                {/* Animated mesh gradient overlay */}
                <div className="fixed inset-0 opacity-60">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse" />
                    <div
                        className="absolute w-96 h-96 rounded-full blur-3xl transition-all duration-[3000ms] ease-out"
                        style={{
                            background: "radial-gradient(circle, rgba(16, 185, 129, 0.2), transparent 70%)",
                            left: `${mousePosition.x * 0.5}%`,
                            top: `${mousePosition.y * 0.3}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                    <div
                        className="absolute w-64 h-64 rounded-full blur-2xl transition-all duration-[2000ms] ease-out"
                        style={{
                            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)",
                            right: `${(100 - mousePosition.x) * 0.4}%`,
                            bottom: `${(100 - mousePosition.y) * 0.2}%`,
                            transform: "translate(50%, 50%)",
                        }}
                    />
                </div>

                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                    <span className="text-white font-bold text-lg">B</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    BookLocal AI
                                </span>
                            </div>

                            <div className="hidden md:flex items-center gap-8">
                                <a href="#features" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Features</a>
                                <a href="#timeline" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Process</a>
                                <a href="#showcase" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">Showcase</a>
                                <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section
                    ref={heroRef}
                    className="relative min-h-screen flex items-center justify-center px-6 pt-20"
                >
                    <div className="max-w-6xl mx-auto text-center relative">
                        {/* Status badge */}
                        <div
                            className={`inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-2xl backdrop-blur-xl border border-white/10 bg-white/5 shadow-2xl transform transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                }`}
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-50"></div>
                            </div>
                            <span className="text-emerald-300 font-semibold tracking-wide">Professional Development Environment</span>
                        </div>

                        {/* Main heading */}
                        <h1
                            className={`text-6xl md:text-8xl font-black mb-8 leading-[0.9] transform transition-all duration-1200 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                                }`}
                        >
                            <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Premium
                            </span>
                            <span className="block bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Development
                            </span>
                            <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Experience
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p
                            className={`text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 transform transition-all duration-1200 delay-400 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                                }`}
                        >
                            Experience enterprise-grade design systems, advanced animations, and professional-level
                            component architecture. Built with cutting-edge technologies and attention to detail
                            that sets industry standards.
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className={`flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 transform transition-all duration-1200 delay-600 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                                }`}
                        >
                            <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center gap-2">
                                    Experience Premium Design
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </button>

                            <button className="group px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10">
                                <div className="flex items-center gap-2">
                                    View Technical Details
                                    <svg className="w-5 h-5 transition-transform group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {/* Performance metrics */}
                        <div
                            className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transform transition-all duration-1200 delay-800 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
                                }`}
                        >
                            {[
                                { label: "Performance", value: "A+", color: "emerald" },
                                { label: "Accessibility", value: "100%", color: "blue" },
                                { label: "Best Practices", value: "A+", color: "purple" },
                                { label: "SEO Ready", value: "100%", color: "amber" }
                            ].map((metric, index) => (
                                <div
                                    key={metric.label}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                        <div className="text-3xl font-black text-white mb-2">{metric.value}</div>
                                        <div className="text-gray-400 text-sm font-medium">{metric.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="animate-bounce">
                            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                                <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features showcase */}
                <section id="features" className="relative py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Professional-Grade Features
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                Every component built with enterprise standards, advanced animations, and pixel-perfect design
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "🎨",
                                    title: "Advanced Design System",
                                    description: "Sophisticated component library with design tokens, consistent spacing, and professional typography",
                                    gradient: "from-emerald-500 to-teal-600"
                                },
                                {
                                    icon: "⚡",
                                    title: "Performance Optimized",
                                    description: "60fps animations, lazy loading, code splitting, and optimized bundle sizes for production",
                                    gradient: "from-blue-500 to-indigo-600"
                                },
                                {
                                    icon: "🔧",
                                    title: "TypeScript Excellence",
                                    description: "100% type safety, advanced interfaces, proper error handling, and maintainable architecture",
                                    gradient: "from-purple-500 to-pink-600"
                                },
                                {
                                    icon: "📱",
                                    title: "Responsive Mastery",
                                    description: "Mobile-first design, adaptive layouts, and seamless experience across all device sizes",
                                    gradient: "from-amber-500 to-orange-600"
                                },
                                {
                                    icon: "🎭",
                                    title: "Micro-Interactions",
                                    description: "Sophisticated hover states, smooth transitions, and delightful user feedback systems",
                                    gradient: "from-teal-500 to-cyan-600"
                                },
                                {
                                    icon: "🚀",
                                    title: "Production Ready",
                                    description: "Enterprise deployment standards, monitoring, error boundaries, and scalable architecture",
                                    gradient: "from-red-500 to-rose-600"
                                }
                            ].map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className="group relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer"
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                                    ></div>

                                    <div className="relative">
                                        <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-300 transition-colors duration-300">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Premium Timeline */}
                <PremiumTimeline />

                {/* Premium Case Studies */}
                <PremiumCaseStudies />

                {/* Technology showcase */}
                <section className="relative py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 text-gradient-premium">
                                Cutting-Edge Technology Stack
                            </h2>
                            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                Built with the latest technologies for maximum performance, scalability, and user experience
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[
                                { name: "Next.js 15", icon: "⚡", color: "from-gray-600 to-gray-800" },
                                { name: "React 19", icon: "⚛️", color: "from-blue-500 to-cyan-600" },
                                { name: "TypeScript", icon: "🔷", color: "from-blue-600 to-blue-800" },
                                { name: "Tailwind CSS", icon: "🎨", color: "from-teal-400 to-blue-500" },
                                { name: "GSAP", icon: "✨", color: "from-green-400 to-emerald-600" },
                                { name: "Three.js", icon: "🎲", color: "from-yellow-400 to-orange-500" },
                                { name: "Framer Motion", icon: "🌊", color: "from-purple-500 to-pink-600" },
                                { name: "Supabase", icon: "🚀", color: "from-emerald-400 to-teal-600" }
                            ].map((tech, index) => (
                                <div
                                    key={tech.name}
                                    className="card-premium text-center group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={`text-4xl mb-4 p-4 rounded-2xl bg-gradient-to-r ${tech.color} inline-block transform group-hover:scale-110 transition-transform duration-300`}>
                                        {tech.icon}
                                    </div>
                                    <h3 className="text-white font-bold text-lg">{tech.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }
