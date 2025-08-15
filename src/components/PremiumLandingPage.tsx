"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Star, Shield, Zap, Users, ArrowRight, Check, Sparkles, Globe, 
  TrendingUp, Award, Play, Calendar, MapPin, Clock, ChevronRight,
  Search, Filter, Heart, Share2, MessageCircle, Phone, Mail,
  Briefcase, Home, Car, Scissors, Paintbrush, Camera, Wrench,
  Monitor, Smartphone, Tablet, Cpu, Wifi, Battery, 
  DollarSign, UserCheck, BarChart3, Globe2
} from 'lucide-react';

// Premium components
import ShaderBg from "./ShaderBg";
import ThreeHero from "./ThreeHero";
import CaseStudy from "./CaseStudy";
import MagneticButton from "./MagneticButton";
import PostProjectPanel from "./PostProjectPanel";
import FinishSwap from "./FinishSwap";
import ProviderDisplay from "./ProviderDisplay";
import AdvancedSearch from "./AdvancedSearch";
import SearchResults from "./SearchResults";
import { useNotifications, useSuccessNotification, useErrorNotification } from "./NotificationProvider";
import TrustMeter from "./TrustMeter";
import DemoModeToggle from "./DemoModeToggle";

// AI Systems
import { handleQuoteRequest } from "../lib/quoteEstimator";
import { assessFraud } from "../lib/fraudDetection";
import { getSupabase } from "../lib/supabaseClient";
import { trackEvent } from "../lib/analytics";
import { captureError } from "../lib/errorMonitoring";

interface MousePosition {
  x: number;
  y: number;
}

// CSS to hide navigation and create immersive landing page experience
const hideNavigationCSS = `
  nav { display: none !important; }
  footer { display: none !important; }
  .glass-card { display: none !important; }
  [data-testid="dark-mode-toggle"] { display: none !important; }
  .dark-mode-toggle { display: none !important; }
  .fixed.inset-x-0.bottom-0 { display: none !important; }
  .fixed[style*="bottom"] { display: none !important; }
  body { margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; }
  html, body { height: 100% !important; }
  #__next { margin: 0 !important; padding: 0 !important; min-height: 100vh !important; }
  main { margin: 0 !important; padding: 0 !important; }
  /* Hide any element containing navigation text */
  *:contains("HomeOnboardingAnalytics") { display: none !important; }
  /* Hide cookie banner more aggressively */
  div[class*="fixed"][class*="bottom"] { display: none !important; }
  div[class*="bg-black"] { display: none !important; }
`;

const PremiumLandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [activeDemo, setActiveDemo] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // AI Systems state
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const supabase = getSupabase();
  
  // Demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [heroGradient, setHeroGradient] = useState([
    "from-white via-blue-100 to-purple-100",
    "from-blue-400 via-purple-400 to-cyan-400", 
    "from-cyan-400 via-blue-400 to-purple-400"
  ]);
  
  // Search functionality state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  
  // Notifications
  const addSuccess = useSuccessNotification();
  const addError = useErrorNotification();

  // Advanced scroll-based animations
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  // Smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothMouseX = useSpring(0, springConfig);
  const smoothMouseY = useSpring(0, springConfig);

  useEffect(() => {
    // Add CSS to hide navigation for immersive premium experience
    const style = document.createElement('style');
    style.textContent = hideNavigationCSS;
    document.head.appendChild(style);
    
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
      smoothMouseX.set(x);
      smoothMouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Auto-cycle demo
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % 4);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
      // Clean up injected CSS
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [smoothMouseX, smoothMouseY]);

  // AI Quote handler
  async function handleGetQuote(category: string, location: string, description: string) {
    setQuoteLoading(true);
    try {
      const quote = await handleQuoteRequest(category, location, description);
      setCurrentQuote(quote);
      trackEvent("ai_quote_generated", { category, min: quote.min, max: quote.max });
      addSuccess("Quote Generated", `Estimated cost: $${quote.min} - $${quote.max}`);
    } catch (error) {
      captureError(error as Error);
      addError("Quote Failed", "Unable to generate quote. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  }

  // Advanced Search handler
  async function handleAdvancedSearch(query: string, filters: any) {
    setSearchLoading(true);
    setSearchQuery(query);
    
    try {
      console.log('🔍 Searching with:', { query, filters });
      
      // Simulate search API call
      const mockResults = [
        {
          id: '1',
          name: 'Elite Flooring Solutions',
          category: 'Flooring',
          rating: 4.8,
          reviews: 127,
          location: 'San Francisco, CA',
          distance: 2.3,
          hourlyRate: 125,
          availability: 'Today',
          profileImage: '/api/placeholder/80/80',
          verified: true,
          trustScore: 94,
          specialties: ['Hardwood', 'Luxury Vinyl', 'Tile'],
          responseTime: '< 1 hour',
          completedJobs: 89,
          description: 'Premium flooring installation with 15+ years experience. Specializing in luxury hardwood and vinyl installations.'
        },
        {
          id: '2',
          name: 'Modern Wall Studio',
          category: 'Painting',
          rating: 4.6,
          reviews: 203,
          location: 'Oakland, CA',
          distance: 5.7,
          hourlyRate: 85,
          availability: 'Tomorrow',
          profileImage: '/api/placeholder/80/80',
          verified: true,
          trustScore: 87,
          specialties: ['Interior Paint', 'Decorative Finishes', 'Wallpaper'],
          responseTime: '2 hours',
          completedJobs: 156,
          description: 'Professional painting services with eco-friendly materials. Expert in color consultation and design.'
        }
      ];
      
      setSearchResults(mockResults);
      setTotalResults(mockResults.length);
      setIsSearchOpen(false);
      
      addSuccess("Search Complete", `Found ${mockResults.length} contractors matching your criteria`);
      
    } catch (error) {
      console.error('Search failed:', error);
      addError("Search Failed", "Unable to search contractors. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  }

  // Premium 3D Card Component
  const Premium3DCard: React.FC<{ children: React.ReactNode; className?: string; index?: number }> = ({ children, className = "", index = 0 }) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        ref={cardRef}
        className={className}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ 
          rotateY: 10, 
          rotateX: 5, 
          scale: 1.05,
          z: 50
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1000
        }}
      >
        <motion.div
          animate={{
            boxShadow: isHovered 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    );
  };

  // Enterprise-grade 3D Phone Demo
  const Enterprise3DPhoneDemo = () => {
    const phoneRef = useRef(null);

    const phoneVariants = {
      step0: { rotateY: 0, rotateX: 0, scale: 1 },
      step1: { rotateY: 15, rotateX: -5, scale: 1.05 },
      step2: { rotateY: -10, rotateX: 5, scale: 1.02 },
      step3: { rotateY: 0, rotateX: 0, scale: 1.1 }
    };

    return (
      <div className="relative w-full max-w-md mx-auto">
        <motion.div
          ref={phoneRef}
          className="relative"
          animate={`step${activeDemo}`}
          variants={phoneVariants}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Premium Phone Frame */}
          <div className="relative w-80 h-96 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[3rem] p-3 shadow-2xl">
            <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
              
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-full z-20 border border-gray-700" />
              
              {/* Screen Content with Advanced Animations */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemo}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600"
                >
                  
                  {/* Step 0: AI-Powered Search */}
                  {activeDemo === 0 && (
                    <div className="p-6 pt-16">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/30"
                      >
                        <div className="flex items-center space-x-3">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          <div className="flex-1">
                            <div className="h-3 bg-white/40 rounded-full animate-pulse" />
                          </div>
                          <Search className="w-5 h-5 text-white" />
                        </div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.5, duration: 1.5 }}
                          className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mt-2"
                        />
                      </motion.div>
                      
                      {/* AI Suggestions */}
                      <div className="space-y-3">
                        {[
                          { icon: Home, label: "Home Cleaning", confidence: 98 },
                          { icon: Wrench, label: "Plumbing", confidence: 95 },
                          { icon: Paintbrush, label: "Interior Design", confidence: 92 }
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-white/15 backdrop-blur-xl rounded-xl p-3 flex items-center space-x-3 border border-white/20"
                          >
                            <item.icon className="w-5 h-5 text-white" />
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">{item.label}</div>
                              <div className="text-xs text-white/70">{item.confidence}% match</div>
                            </div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Real-time Provider Matching */}
                  {activeDemo === 1 && (
                    <div className="p-6 pt-16">
                      <div className="text-center mb-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-3"
                        />
                        <div className="text-white font-medium">Finding nearby professionals...</div>
                      </div>
                      
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white/20 backdrop-blur-xl rounded-xl p-4 border border-white/30"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="h-3 bg-white/60 rounded-full" style={{ width: `${60 + i * 20}px` }} />
                                  <div className="flex">
                                    {[...Array(5)].map((_, j) => (
                                      <Star key={j} className="w-3 h-3 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                </div>
                                <div className="h-2 bg-white/40 rounded-full mt-1" style={{ width: `${40 + i * 15}px` }} />
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">${(50 + i * 20)}</div>
                                <div className="text-xs text-white/70">0.{i} miles</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Instant Booking & Payment */}
                  {activeDemo === 2 && (
                    <div className="p-6 pt-16">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/30 mb-6"
                      >
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                          >
                            <DollarSign className="w-8 h-8 text-white" />
                          </motion.div>
                          <div className="text-white font-bold text-lg mb-2">Secure Payment</div>
                          <div className="text-white/70 text-sm">Enterprise-grade encryption</div>
                        </div>
                      </motion.div>
                      
                      {/* Payment Methods */}
                      <div className="grid grid-cols-2 gap-3">
                        {['Card', 'Apple Pay', 'Google Pay', 'Bank'].map((method, i) => (
                          <motion.div
                            key={method}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="bg-white/15 backdrop-blur-xl rounded-lg p-3 text-center border border-white/20"
                          >
                            <div className="text-white text-sm font-medium">{method}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Live Tracking & Updates */}
                  {activeDemo === 3 && (
                    <div className="p-6 pt-16">
                      <div className="text-center mb-6">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Check className="w-10 h-10 text-white" />
                        </motion.div>
                        <div className="text-white font-bold text-lg">Service Confirmed!</div>
                        <div className="text-white/70">Track in real-time</div>
                      </div>
                      
                      {/* Live Updates */}
                      <div className="space-y-3">
                        {[
                          { time: '2:30 PM', status: 'Professional on the way', active: true },
                          { time: '2:45 PM', status: 'Arriving in 5 minutes', active: false },
                          { time: '3:00 PM', status: 'Service begins', active: false }
                        ].map((update, i) => (
                          <motion.div
                            key={i}
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.3 }}
                            className={`flex items-center space-x-3 p-3 rounded-lg ${
                              update.active ? 'bg-green-500/20 border border-green-400/30' : 'bg-white/10 border border-white/20'
                            } backdrop-blur-xl`}
                          >
                            <div className={`w-3 h-3 rounded-full ${
                              update.active ? 'bg-green-400 animate-pulse' : 'bg-white/40'
                            }`} />
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">{update.status}</div>
                              <div className="text-white/60 text-xs">{update.time}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Screen Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-[2.5rem] pointer-events-none" />
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <motion.div
            animate={{
              x: mousePosition.x * 20,
              y: mousePosition.y * 10
            }}
            className="absolute -right-20 top-16"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl">
              <div className="flex items-center space-x-2 text-white text-sm">
                <MapPin className="w-4 h-4 text-green-400" />
                <span>2.3 miles away</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{
              x: mousePosition.x * -15,
              y: mousePosition.y * 8
            }}
            className="absolute -left-16 bottom-24"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl">
              <div className="flex items-center space-x-2 text-white text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>15 min ETA</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-3 mt-8">
          {['AI Search', 'Match', 'Book', 'Track'].map((label, index) => (
            <motion.div
              key={index}
              className={`flex items-center space-x-2 transition-all duration-500 ${
                activeDemo === index ? 'text-blue-400 scale-110' : 'text-white/50'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className={`w-3 h-3 rounded-full transition-all duration-500`}
                animate={{
                  backgroundColor: activeDemo === index ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                  boxShadow: activeDemo === index ? '0 0 20px rgba(96,165,250,0.6)' : 'none'
                }}
              />
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Enterprise Stats Dashboard
  const EnterpriseStatsDisplay = () => {
    const statsData = [
      { 
        label: 'Enterprise Clients', 
        value: '2,847', 
        growth: '+234%',
        icon: Briefcase,
        color: 'from-blue-400 to-blue-600',
        description: 'Fortune 500 companies'
      },
      { 
        label: 'Platform Revenue', 
        value: '$24.8M', 
        growth: '+156%',
        icon: TrendingUp,
        color: 'from-green-400 to-green-600',
        description: 'Monthly recurring revenue'
      },
      { 
        label: 'AI Accuracy', 
        value: '99.7%', 
        growth: '+12.3%',
        icon: Cpu,
        color: 'from-purple-400 to-purple-600',
        description: 'Matching precision'
      },
      { 
        label: 'Global Coverage', 
        value: '127', 
        growth: '+43',
        icon: Globe2,
        color: 'from-cyan-400 to-cyan-600',
        description: 'Countries & territories'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statsData.map((stat, index) => (
          <Premium3DCard key={index} index={index}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold"
                >
                  {stat.growth}
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70 font-medium mb-1">{stat.label}</div>
                <div className="text-white/50 text-sm">{stat.description}</div>
              </motion.div>

              {/* Progress visualization */}
              <div className="mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, delay: index * 0.3 }}
                  className={`h-1 bg-gradient-to-r ${stat.color} rounded-full`}
                />
              </div>
            </div>
          </Premium3DCard>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        overflow: 'auto'
      }}
    >
      
      {/* Ultra-Premium Background System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, 
              rgba(59, 130, 246, 0.3) 0%, 
              rgba(147, 51, 234, 0.2) 33%, 
              rgba(236, 72, 153, 0.1) 66%, 
              transparent 100%)`
          }}
        />
        
        {/* Animated mesh overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            y: parallaxY,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Premium Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl px-8 py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-4"
              >
                <motion.div
                  animate={{ 
                    rotateY: mousePosition.x * 10,
                    rotateX: mousePosition.y * 5 
                  }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <span className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    BookLocal
                  </span>
                  <div className="text-sm text-blue-300 font-semibold">Enterprise Professional Services</div>
                </div>
              </motion.div>
              
              <div className="hidden md:flex items-center space-x-8">
                {['Enterprise', 'Platform', 'Analytics', 'API'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="relative text-white/80 hover:text-white transition-all duration-300 font-semibold group"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {item}
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 px-8 py-3 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300"
                >
                  Request Demo
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Revolutionary Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 px-6 pt-20 pb-40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            
            {/* Premium Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-2xl border border-white/30 rounded-full px-8 py-4 mb-16 shadow-2xl"
            >
              <Award className="w-6 h-6 text-blue-300" />
              <span className="text-white font-bold text-lg">Enterprise-Grade Platform • 10M+ Transactions</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
            </motion.div>

            {/* Hero Typography */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mb-16"
            >
              <h1 className="text-7xl md:text-9xl font-black leading-tight mb-8">
                <motion.span
                  className="block bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  Enterprise
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                >
                  Professional
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                  Platform
                </motion.span>
              </h1>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-5xl mx-auto shadow-2xl"
              >
                <p className="text-2xl md:text-3xl text-white/90 leading-relaxed font-light">
                  AI-powered service marketplace with enterprise-grade security, 
                  real-time analytics, and global scalability. Trusted by Fortune 500 companies.
                </p>
              </motion.div>
            </motion.div>

            {/* Premium CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 px-12 py-6 rounded-3xl text-2xl font-bold shadow-2xl transition-all duration-500"
              >
                <span className="relative z-10 flex items-center text-white">
                  Start Enterprise Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-4 w-7 h-7" />
                  </motion.div>
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="group flex items-center space-x-6 text-white/80 hover:text-white transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl group-hover:bg-white/20 transition-all duration-300"
                >
                  <Play className="w-9 h-9 ml-2" />
                </motion.div>
                <div className="text-left">
                  <div className="text-xl font-bold">Watch Platform Demo</div>
                  <div className="text-white/60">See enterprise features in action</div>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Shader Background Enhancement */}
      <ShaderBg />
      
      {/* 3D Interactive Hero */}
      <section className="relative z-10 px-6 py-20 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              Experience the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Future</span>
            </h2>
            <div className="flex justify-center mb-8">
              <TrustMeter />
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              <MagneticButton onClick={() => window.dispatchEvent(new Event("openPostPanel"))}>
                Post a Project
              </MagneticButton>
              <MagneticButton onClick={() => setIsSearchOpen(true)}>
                Advanced Search
              </MagneticButton>
              <FinishSwap />
            </div>
            
            {/* Provider display for selected materials */}
            <div className="max-w-2xl mx-auto">
              <ProviderDisplay />
            </div>
          </div>
          <ThreeHero onStep={(step: number) => {}} />
        </div>
      </section>
      
      {/* GSAP Storytelling */}
      <CaseStudy />

      {/* Enterprise Demo Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
              Platform in <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience the most advanced professional services platform ever built. 
              Real-time AI matching, enterprise security, and global scalability.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* 3D Phone Demo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <Enterprise3DPhoneDemo />
            </motion.div>

            {/* Enterprise Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-4xl font-bold text-white mb-6">Enterprise Impact</h3>
                <p className="text-xl text-white/70 mb-8">
                  Real-time metrics from our global platform serving millions of professionals and enterprises worldwide.
                </p>
              </div>
              
              <EnterpriseStatsDisplay />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Features Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
              Enterprise <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Features</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SOC 2 Type II certified with end-to-end encryption and advanced threat protection.",
                color: "from-blue-400 to-blue-600"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Advanced business intelligence with predictive analytics and custom dashboards.",
                color: "from-green-400 to-green-600"
              },
              {
                icon: Cpu,
                title: "AI-Powered Matching",
                description: "Machine learning algorithms with 99.7% accuracy for optimal professional matching.",
                color: "from-purple-400 to-purple-600"
              },
              {
                icon: Globe2,
                title: "Global Scalability",
                description: "Multi-region deployment with 99.99% uptime and automatic scaling capabilities.",
                color: "from-cyan-400 to-cyan-600"
              },
              {
                icon: Zap,
                title: "API-First Platform",
                description: "RESTful APIs and webhooks for seamless integration with existing enterprise systems.",
                color: "from-yellow-400 to-orange-600"
              },
              {
                icon: Users,
                title: "Enterprise Support",
                description: "24/7 dedicated support with custom SLAs and white-glove onboarding.",
                color: "from-pink-400 to-pink-600"
              }
            ].map((feature, index) => (
              <Premium3DCard key={index} index={index}>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-500">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </Premium3DCard>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-16 shadow-2xl"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
              Ready for <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Enterprise?</span>
            </h2>
            <p className="text-2xl text-white/80 mb-12 leading-relaxed">
              Join Fortune 500 companies already transforming their professional services with our platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 px-12 py-6 rounded-2xl text-xl font-bold text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                Start Enterprise Trial
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 px-12 py-6 rounded-2xl text-xl font-bold text-white hover:bg-white/10 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Post Project Panel */}
      <PostProjectPanel />
      
      {/* Demo Mode Toggle */}
      <DemoModeToggle onToggle={setIsDemoMode} />
      
      {/* Advanced Search Modal */}
      <AdvancedSearch 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />
      
      {/* Search Results Section */}
      {searchResults.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <SearchResults 
              results={searchResults}
              loading={searchLoading}
              query={searchQuery}
              totalResults={totalResults}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default PremiumLandingPage;
