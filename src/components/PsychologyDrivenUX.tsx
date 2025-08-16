"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Brain,
  Eye,
  MousePointer,
  Clock,
  Heart,
  Zap,
  Shield,
  Star,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Bell,
  Target,
  Activity,
  Gauge,
  Award,
  Globe,
  Lock,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  Timer,
  Lightbulb,
  Coffee,
  Sun,
  Moon,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  MessageCircle,
  Camera,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  Info,
  HelpCircle,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Flame,
  Snowflake
} from 'lucide-react';

// Types for behavioral tracking
interface UserBehavior {
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  clickPatterns: Array<{ x: number; y: number; timestamp: number; element: string }>;
  scrollBehavior: Array<{ position: number; timestamp: number; direction: 'up' | 'down' }>;
  decisionTimes: Array<{ action: string; duration: number; timestamp: number }>;
  sessionDuration: number;
  returnPatterns: Array<{ timestamp: number; sessionLength: number }>;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface UserPersonality {
  decisionMakingStyle: 'fast' | 'methodical' | 'mixed';
  informationPreference: 'visual' | 'textual' | 'mixed';
  trustBuildingNeeds: 'security-focused' | 'convenience-focused' | 'balanced';
  socialProofSensitivity: 'high' | 'medium' | 'low';
  priceSensitivity: 'budget-conscious' | 'quality-focused' | 'balanced';
  confidenceLevel: number; // 0-100
}

interface EmotionalState {
  currentMood: 'frustrated' | 'confident' | 'uncertain' | 'impatient' | 'satisfied';
  engagementLevel: number; // 0-100
  cognitiveLoad: number; // 0-100
  trustLevel: number; // 0-100
  urgencyLevel: number; // 0-100
}

interface AdaptiveInterface {
  layout: 'streamlined' | 'detailed' | 'visual' | 'comprehensive';
  contentStyle: 'minimal' | 'rich' | 'social-proof-heavy' | 'security-focused';
  interactionSpeed: 'fast' | 'normal' | 'deliberate';
  helpLevel: 'minimal' | 'contextual' | 'comprehensive';
}

// Mock data for demonstration
const mockUserBehavior: UserBehavior = {
  mouseMovements: [],
  clickPatterns: [],
  scrollBehavior: [],
  decisionTimes: [
    { action: 'contractor_selection', duration: 45000, timestamp: Date.now() - 300000 },
    { action: 'booking_time', duration: 12000, timestamp: Date.now() - 200000 },
    { action: 'payment_method', duration: 8000, timestamp: Date.now() - 100000 }
  ],
  sessionDuration: 1200000, // 20 minutes
  returnPatterns: [
    { timestamp: Date.now() - 86400000, sessionLength: 600000 },
    { timestamp: Date.now() - 172800000, sessionLength: 900000 }
  ],
  deviceType: 'desktop'
};

const mockPersonality: UserPersonality = {
  decisionMakingStyle: 'methodical',
  informationPreference: 'visual',
  trustBuildingNeeds: 'security-focused',
  socialProofSensitivity: 'high',
  priceSensitivity: 'quality-focused',
  confidenceLevel: 75
};

const mockEmotionalState: EmotionalState = {
  currentMood: 'confident',
  engagementLevel: 85,
  cognitiveLoad: 40,
  trustLevel: 80,
  urgencyLevel: 30
};

// Social proof messages
const socialProofMessages = [
  "3 people are viewing this contractor right now",
  "Sarah hired a plumber 2 minutes ago in your area",
  "95% of projects completed on time in your neighborhood",
  "Homeowners like you typically choose contractors with 4.8+ ratings",
  "15 people booked services in the last hour",
  "This contractor has 98% client satisfaction rate"
];

// Micro-interaction components
const AnticipationLoader: React.FC<{ message: string }> = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-400/30 rounded-2xl"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
    />
    <span className="text-blue-400 font-medium">{message}</span>
  </motion.div>
);

const SuccessCelebration: React.FC<{ message: string; onComplete: () => void }> = ({ message, onComplete }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.5, y: -20 }}
    onAnimationComplete={onComplete}
    className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl"
  >
    <div className="flex items-center space-x-3">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
      >
        <CheckCircle className="w-6 h-6" />
      </motion.div>
      <span className="font-semibold">{message}</span>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles className="w-5 h-5" />
      </motion.div>
    </div>
  </motion.div>
);

const FrustrationDetector: React.FC<{ onFrustrationDetected: () => void }> = ({ onFrustrationDetected }) => {
  const [rapidClicks, setRapidClicks] = useState(0);
  const clickTimeouts = useRef<NodeJS.Timeout[]>([]);

  const handleClick = useCallback(() => {
    setRapidClicks(prev => prev + 1);
    
    const timeout = setTimeout(() => {
      setRapidClicks(prev => Math.max(0, prev - 1));
    }, 2000);
    
    clickTimeouts.current.push(timeout);
    
    if (rapidClicks >= 3) {
      onFrustrationDetected();
      setRapidClicks(0);
    }
  }, [rapidClicks, onFrustrationDetected]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      clickTimeouts.current.forEach(clearTimeout);
    };
  }, [handleClick]);

  return null;
};

const TrustSignal: React.FC<{ type: 'security' | 'social' | 'guarantee' | 'expertise'; children: React.ReactNode }> = ({ type, children }) => {
  const getIcon = () => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4 text-green-400" />;
      case 'social': return <Users className="w-4 h-4 text-blue-400" />;
      case 'guarantee': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'expertise': return <Award className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-sm text-white/80"
    >
      {getIcon()}
      <span>{children}</span>
    </motion.div>
  );
};

const AdaptiveButton: React.FC<{ 
  variant: 'fast-decider' | 'methodical' | 'trust-focused'; 
  children: React.ReactNode;
  onClick: () => void;
}> = ({ variant, children, onClick }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'fast-decider':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-4 text-lg';
      case 'methodical':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3';
      case 'trust-focused':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium px-6 py-3 border border-purple-400/30';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-2xl transition-all duration-300 ${getVariantStyles()}`}
    >
      {children}
    </motion.button>
  );
};

const ProgressSatisfaction: React.FC<{ step: number; totalSteps: number; currentStepName: string }> = ({ step, totalSteps, currentStepName }) => (
  <div className="w-full max-w-md mx-auto mb-8">
    <div className="flex items-center justify-between mb-2">
      <span className="text-white/80 text-sm">Step {step} of {totalSteps}</span>
      <span className="text-white font-semibold text-sm">{currentStepName}</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full relative"
      >
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute right-0 top-0 w-2 h-full bg-white/30 rounded-full"
        />
      </motion.div>
    </div>
    <div className="flex justify-between mt-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: i < step ? 1 : 0.7 }}
          className={`w-2 h-2 rounded-full ${
            i < step ? 'bg-green-400' : i === step ? 'bg-blue-400' : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  </div>
);

const MoodBasedInterface: React.FC<{ mood: EmotionalState['currentMood']; children: React.ReactNode }> = ({ mood, children }) => {
  const getMoodStyles = () => {
    switch (mood) {
      case 'frustrated':
        return 'border-red-400/30 bg-red-500/5';
      case 'confident':
        return 'border-green-400/30 bg-green-500/5';
      case 'uncertain':
        return 'border-yellow-400/30 bg-yellow-500/5';
      case 'impatient':
        return 'border-orange-400/30 bg-orange-500/5';
      default:
        return 'border-blue-400/30 bg-blue-500/5';
    }
  };

  const getMoodIcon = () => {
    switch (mood) {
      case 'frustrated': return <Frown className="w-4 h-4 text-red-400" />;
      case 'confident': return <Smile className="w-4 h-4 text-green-400" />;
      case 'uncertain': return <Meh className="w-4 h-4 text-yellow-400" />;
      case 'impatient': return <Timer className="w-4 h-4 text-orange-400" />;
      default: return <Heart className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border rounded-3xl p-6 ${getMoodStyles()}`}
    >
      <div className="flex items-center space-x-2 mb-4">
        {getMoodIcon()}
        <span className="text-white/80 text-sm capitalize">Optimized for {mood} users</span>
      </div>
      {children}
    </motion.div>
  );
};

const SocialProofTicker: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % socialProofMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={currentMessage}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-400 font-medium">{socialProofMessages[currentMessage]}</span>
        <Users className="w-4 h-4 text-green-400" />
      </div>
    </motion.div>
  );
};

const ContextualHelp: React.FC<{ trigger: 'hover' | 'click'; helpText: string; children: React.ReactNode }> = ({ trigger, helpText, children }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative">
      <div
        onMouseEnter={() => trigger === 'hover' && setShowHelp(true)}
        onMouseLeave={() => trigger === 'hover' && setShowHelp(false)}
        onClick={() => trigger === 'click' && setShowHelp(!showHelp)}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full left-0 mt-2 p-4 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm max-w-xs z-50"
          >
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>{helpText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SmartDefault: React.FC<{ value: string; confidence: number; onAccept: () => void; onReject: () => void }> = ({ value, confidence, onAccept, onReject }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-4"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Brain className="w-5 h-5 text-blue-400" />
        <div>
          <div className="text-white font-semibold">Smart Suggestion</div>
          <div className="text-white/70 text-sm">Based on your preferences: {value}</div>
          <div className="text-blue-400 text-xs">{confidence}% confidence</div>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onAccept}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
        >
          Use This
        </button>
        <button
          onClick={onReject}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
        >
          Choose Different
        </button>
      </div>
    </div>
  </motion.div>
);

export default function PsychologyDrivenUX() {
  const [userPersonality, setUserPersonality] = useState<UserPersonality>(mockPersonality);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(mockEmotionalState);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFrustrationHelp, setShowFrustrationHelp] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [adaptiveLayout, setAdaptiveLayout] = useState<AdaptiveInterface['layout']>('detailed');

  // Behavioral learning simulation
  useEffect(() => {
    const analyzeUserBehavior = () => {
      // Simulate behavioral analysis
      const avgDecisionTime = mockUserBehavior.decisionTimes.reduce((sum, dt) => sum + dt.duration, 0) / mockUserBehavior.decisionTimes.length;
      
      setUserPersonality(prev => ({
        ...prev,
        decisionMakingStyle: avgDecisionTime > 30000 ? 'methodical' : avgDecisionTime < 10000 ? 'fast' : 'mixed',
        confidenceLevel: Math.min(100, prev.confidenceLevel + 5)
      }));
    };

    const interval = setInterval(analyzeUserBehavior, 10000);
    return () => clearInterval(interval);
  }, []);

  // Adaptive interface updates
  useEffect(() => {
    if (userPersonality.decisionMakingStyle === 'fast') {
      setAdaptiveLayout('streamlined');
    } else if (userPersonality.informationPreference === 'visual') {
      setAdaptiveLayout('visual');
    } else {
      setAdaptiveLayout('detailed');
    }
  }, [userPersonality]);

  const handleFrustrationDetected = () => {
    setShowFrustrationHelp(true);
    setEmotionalState(prev => ({ ...prev, currentMood: 'frustrated' }));
  };

  const handleSuccessAction = () => {
    setShowSuccessMessage(true);
    setEmotionalState(prev => ({ 
      ...prev, 
      currentMood: 'confident',
      trustLevel: Math.min(100, prev.trustLevel + 10)
    }));
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const simulateBookingFlow = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(prev => Math.min(4, prev + 1));
      handleSuccessAction();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Frustration Detection */}
        <FrustrationDetector onFrustrationDetected={handleFrustrationDetected} />

        {/* Success Celebration */}
        <AnimatePresence>
          {showSuccessMessage && (
            <SuccessCelebration 
              message="Great choice! Your booking is confirmed."
              onComplete={() => setShowSuccessMessage(false)}
            />
          )}
        </AnimatePresence>

        {/* Frustration Help Modal */}
        <AnimatePresence>
          {showFrustrationHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md mx-4"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Need Help?</h3>
                  <p className="text-white/80 mb-6">
                    I noticed you might be having trouble. Would you like me to guide you through this step?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowFrustrationHelp(false)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-2xl font-semibold transition-colors"
                    >
                      Yes, Help Me
                    </button>
                    <button
                      onClick={() => setShowFrustrationHelp(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-2xl font-semibold transition-colors"
                    >
                      I'm Fine
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Psychology-Driven UX
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Advanced behavioral learning system that adapts to your personality, 
            emotional state, and decision-making patterns for optimal user experience.
          </p>
        </motion.div>

        {/* User Personality Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 rounded-3xl mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-3" />
            Behavioral Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Decision Style</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2 capitalize">{userPersonality.decisionMakingStyle}</div>
              <div className="text-white/70 text-sm">
                {userPersonality.decisionMakingStyle === 'fast' 
                  ? 'You make quick decisions and prefer streamlined interfaces'
                  : userPersonality.decisionMakingStyle === 'methodical'
                  ? 'You take time to analyze options and prefer detailed information'
                  : 'You adapt your decision style based on the situation'
                }
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Information Style</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2 capitalize">{userPersonality.informationPreference}</div>
              <div className="text-white/70 text-sm">
                {userPersonality.informationPreference === 'visual'
                  ? 'You prefer images, charts, and visual representations'
                  : 'You prefer detailed text and comprehensive descriptions'
                }
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Trust Level</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{emotionalState.trustLevel}%</div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emotionalState.trustLevel}%` }}
                  className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Proof Ticker */}
        <SocialProofTicker />

        {/* Adaptive Interface Demo */}
        <MoodBasedInterface mood={emotionalState.currentMood}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3" />
            Adaptive Booking Interface
          </h2>

          {/* Progress Indicator */}
          <ProgressSatisfaction 
            step={currentStep} 
            totalSteps={4} 
            currentStepName={
              currentStep === 1 ? 'Select Service' :
              currentStep === 2 ? 'Choose Contractor' :
              currentStep === 3 ? 'Schedule Time' : 'Confirm Booking'
            }
          />

          {/* Smart Default Suggestion */}
          {currentStep === 2 && (
            <SmartDefault
              value="Top-rated electrician in your area"
              confidence={87}
              onAccept={() => simulateBookingFlow()}
              onReject={() => {}}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <AnticipationLoader message="Finding the perfect contractor for you..." />
          )}

          {/* Trust Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TrustSignal type="security">
              256-bit SSL encryption protects your data
            </TrustSignal>
            <TrustSignal type="guarantee">
              100% money-back guarantee on all services
            </TrustSignal>
            <TrustSignal type="social">
              Trusted by 50,000+ homeowners
            </TrustSignal>
            <TrustSignal type="expertise">
              All contractors are licensed and insured
            </TrustSignal>
          </div>

          {/* Adaptive Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <AdaptiveButton
              variant={userPersonality.decisionMakingStyle === 'fast' ? 'fast-decider' : 'methodical'}
              onClick={simulateBookingFlow}
            >
              {userPersonality.decisionMakingStyle === 'fast' ? 'Book Now' : 'Review & Book'}
            </AdaptiveButton>

            <ContextualHelp
              trigger="hover"
              helpText="This will start a secure booking process. You can cancel anytime before confirmation."
            >
              <AdaptiveButton variant="trust-focused" onClick={() => {}}>
                Learn More
              </AdaptiveButton>
            </ContextualHelp>
          </div>

          {/* Risk Reduction Elements */}
          {userPersonality.trustBuildingNeeds === 'security-focused' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-2xl"
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div>
                  <div className="text-white font-semibold">Security Guarantee</div>
                  <div className="text-white/70 text-sm">
                    Your payment is held in escrow until work is completed to your satisfaction
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </MoodBasedInterface>

        {/* Emotional Intelligence Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 rounded-3xl mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-3" />
            Emotional Intelligence Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'Engagement Level', 
                value: emotionalState.engagementLevel, 
                icon: TrendingUp, 
                color: 'text-green-400',
                description: 'How actively engaged you are with the platform'
              },
              { 
                label: 'Cognitive Load', 
                value: emotionalState.cognitiveLoad, 
                icon: Brain, 
                color: 'text-blue-400',
                description: 'Mental effort required to use the interface'
              },
              { 
                label: 'Confidence Level', 
                value: userPersonality.confidenceLevel, 
                icon: ThumbsUp, 
                color: 'text-purple-400',
                description: 'Your confidence in making decisions'
              },
              { 
                label: 'Urgency Level', 
                value: emotionalState.urgencyLevel, 
                icon: Timer, 
                color: 'text-orange-400',
                description: 'How urgent your current need is'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  <h3 className="text-lg font-semibold text-white">{metric.label}</h3>
                </div>
                
                <div className="text-3xl font-bold text-white mb-2">{metric.value}%</div>
                
                <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: 0.2 * index }}
                    className={`h-2 rounded-full ${
                      metric.value > 70 ? 'bg-green-500' :
                      metric.value > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
                
                <div className="text-white/70 text-sm">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Micro-Interaction Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-8 rounded-3xl mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-3" />
            Psychological Micro-Interactions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Anticipatory Feedback</h3>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
                >
                  <motion.span
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0.8 }}
                  >
                    Hover for Preview
                  </motion.span>
                </motion.button>

                <motion.div
                  whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                  className="p-4 border border-white/10 rounded-2xl cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Auto-save enabled</span>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Emotional Responses</h3>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-green-500/10 border border-green-400/30 rounded-2xl cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                    <span className="text-white">Success celebration</span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-2xl cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Lightbulb className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-white">Contextual help</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}