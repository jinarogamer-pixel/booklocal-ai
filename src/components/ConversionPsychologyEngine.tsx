"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock,
  Users,
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Eye,
  Heart,
  Zap,
  Award,
  Lock,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Percent,
  Timer,
  Flame,
  Snowflake,
  Target,
  ThumbsUp,
  MessageCircle,
  Camera,
  FileText,
  Download,
  Share2,
  Bookmark,
  Bell,
  Gift,
  Crown,
  Sparkles,
  Lightning,
  Rocket,
  Brain,
  BarChart3
} from 'lucide-react';

interface ScarcityTrigger {
  type: 'time' | 'quantity' | 'availability' | 'demand';
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  credible: boolean;
  timeRemaining?: number;
  quantityRemaining?: number;
}

interface SocialProofElement {
  type: 'testimonial' | 'activity' | 'statistic' | 'expert' | 'peer';
  content: string;
  credibility: number; // 0-100
  relevance: number; // 0-100
  recency: number; // minutes ago
  verified: boolean;
}

interface TrustSignal {
  type: 'security' | 'guarantee' | 'certification' | 'transparency' | 'social';
  icon: React.ElementType;
  title: string;
  description: string;
  prominence: 'subtle' | 'moderate' | 'prominent';
  verifiable: boolean;
}

interface ReciprocityOffer {
  type: 'free_value' | 'consultation' | 'trial' | 'discount' | 'bonus';
  title: string;
  description: string;
  value: string;
  timeLimit?: number;
  claimed: boolean;
}

interface CommitmentDevice {
  type: 'preference' | 'goal' | 'social' | 'investment';
  action: string;
  commitment: string;
  reinforcement: string;
  publicVisible: boolean;
}

// Mock data for demonstration
const scarcityTriggers: ScarcityTrigger[] = [
  {
    type: 'availability',
    message: 'Only 2 electricians available this week in your area',
    urgencyLevel: 'high',
    credible: true,
    quantityRemaining: 2
  },
  {
    type: 'demand',
    message: '15 homeowners are looking for contractors right now',
    urgencyLevel: 'medium',
    credible: true
  },
  {
    type: 'time',
    message: 'Spring booking discount ends in 2 days',
    urgencyLevel: 'medium',
    credible: true,
    timeRemaining: 172800000 // 2 days in milliseconds
  },
  {
    type: 'quantity',
    message: '3 premium time slots left this month',
    urgencyLevel: 'low',
    credible: true,
    quantityRemaining: 3
  }
];

const socialProofElements: SocialProofElement[] = [
  {
    type: 'activity',
    content: 'Sarah just booked a plumber 3 minutes ago',
    credibility: 95,
    relevance: 85,
    recency: 3,
    verified: true
  },
  {
    type: 'statistic',
    content: '94% of homeowners in your neighborhood rate our contractors 5 stars',
    credibility: 90,
    relevance: 90,
    recency: 0,
    verified: true
  },
  {
    type: 'testimonial',
    content: '"Best contractor experience I\'ve ever had. Professional and on-time!" - Mike R.',
    credibility: 85,
    relevance: 80,
    recency: 60,
    verified: true
  },
  {
    type: 'peer',
    content: 'Homeowners like you typically choose contractors with 4.8+ ratings',
    credibility: 80,
    relevance: 95,
    recency: 0,
    verified: true
  },
  {
    type: 'expert',
    content: 'Recommended by Better Business Bureau - A+ Rating',
    credibility: 95,
    relevance: 70,
    recency: 0,
    verified: true
  }
];

const trustSignals: TrustSignal[] = [
  {
    type: 'security',
    icon: Shield,
    title: 'Bank-Level Security',
    description: '256-bit SSL encryption protects all your data',
    prominence: 'prominent',
    verifiable: true
  },
  {
    type: 'guarantee',
    icon: CheckCircle,
    title: '100% Satisfaction Guarantee',
    description: 'Full refund if you\'re not completely satisfied',
    prominence: 'prominent',
    verifiable: true
  },
  {
    type: 'certification',
    icon: Award,
    title: 'Licensed & Insured',
    description: 'All contractors are fully licensed and carry insurance',
    prominence: 'moderate',
    verifiable: true
  },
  {
    type: 'transparency',
    icon: Eye,
    title: 'No Hidden Fees',
    description: 'Clear, upfront pricing with detailed breakdowns',
    prominence: 'moderate',
    verifiable: true
  },
  {
    type: 'social',
    icon: Users,
    title: 'Trusted by 50,000+',
    description: 'Join thousands of satisfied homeowners',
    prominence: 'subtle',
    verifiable: true
  }
];

const reciprocityOffers: ReciprocityOffer[] = [
  {
    type: 'consultation',
    title: 'Free Expert Consultation',
    description: 'Get professional advice on your project - no obligation',
    value: '$150 value',
    claimed: false
  },
  {
    type: 'free_value',
    title: 'Home Maintenance Guide',
    description: 'Complete seasonal maintenance checklist and tips',
    value: 'Instant download',
    claimed: false
  },
  {
    type: 'discount',
    title: 'Early Bird Special',
    description: '15% off your first booking when you schedule this week',
    value: 'Save up to $300',
    timeLimit: 604800000, // 1 week
    claimed: false
  }
];

const commitmentDevices: CommitmentDevice[] = [
  {
    type: 'preference',
    action: 'Set your service preferences',
    commitment: 'I prefer eco-friendly contractors',
    reinforcement: 'We\'ll match you with green-certified professionals',
    publicVisible: false
  },
  {
    type: 'goal',
    action: 'Set your project timeline',
    commitment: 'I want to complete this project by March 15th',
    reinforcement: 'We\'ll prioritize contractors who can meet your deadline',
    publicVisible: false
  },
  {
    type: 'social',
    action: 'Share your home improvement journey',
    commitment: 'Following my kitchen renovation progress',
    reinforcement: 'Get support and tips from our community',
    publicVisible: true
  }
];

const ScarcityIndicator: React.FC<{ trigger: ScarcityTrigger }> = ({ trigger }) => {
  const [timeLeft, setTimeLeft] = useState(trigger.timeRemaining || 0);

  useEffect(() => {
    if (trigger.type === 'time' && trigger.timeRemaining) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [trigger]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  const getUrgencyColor = () => {
    switch (trigger.urgencyLevel) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      case 'low': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
    }
  };

  const getIcon = () => {
    switch (trigger.type) {
      case 'time': return <Clock className="w-4 h-4" />;
      case 'quantity': return <Target className="w-4 h-4" />;
      case 'availability': return <Users className="w-4 h-4" />;
      case 'demand': return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border rounded-2xl p-4 ${getUrgencyColor()}`}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {getIcon()}
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold">{trigger.message}</div>
          {trigger.type === 'time' && timeLeft > 0 && (
            <div className="text-sm opacity-80">
              Time remaining: {formatTime(timeLeft)}
            </div>
          )}
          {trigger.type === 'quantity' && trigger.quantityRemaining && (
            <div className="text-sm opacity-80">
              Only {trigger.quantityRemaining} remaining
            </div>
          )}
        </div>
        {trigger.urgencyLevel === 'high' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Flame className="w-5 h-5" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const SocialProofTicker: React.FC<{ elements: SocialProofElement[] }> = ({ elements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % elements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [elements.length]);

  const currentElement = elements[currentIndex];

  const getIcon = () => {
    switch (currentElement.type) {
      case 'activity': return <Bell className="w-4 h-4 text-green-400" />;
      case 'statistic': return <BarChart3 className="w-4 h-4 text-blue-400" />;
      case 'testimonial': return <MessageCircle className="w-4 h-4 text-purple-400" />;
      case 'peer': return <Users className="w-4 h-4 text-yellow-400" />;
      case 'expert': return <Award className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-start space-x-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          {getIcon()}
        </motion.div>
        <div className="flex-1">
          <div className="text-white font-medium">{currentElement.content}</div>
          <div className="flex items-center space-x-3 mt-2">
            {currentElement.verified && (
              <div className="flex items-center space-x-1 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </div>
            )}
            {currentElement.recency > 0 && (
              <div className="text-white/60 text-xs">
                {currentElement.recency} min ago
              </div>
            )}
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(currentElement.credibility / 20)
                      ? 'text-yellow-400 fill-current'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TrustBadge: React.FC<{ signal: TrustSignal }> = ({ signal }) => {
  const getProminenceStyle = () => {
    switch (signal.prominence) {
      case 'prominent':
        return 'bg-green-500/20 border-green-400/40 text-green-400 p-4';
      case 'moderate':
        return 'bg-blue-500/10 border-blue-400/30 text-blue-400 p-3';
      case 'subtle':
        return 'bg-white/5 border-white/10 text-white/80 p-2';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`border rounded-2xl ${getProminenceStyle()}`}
    >
      <div className="flex items-center space-x-3">
        <signal.icon className="w-5 h-5" />
        <div>
          <div className="font-semibold">{signal.title}</div>
          <div className="text-sm opacity-80">{signal.description}</div>
          {signal.verifiable && (
            <div className="flex items-center space-x-1 mt-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Verified</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ReciprocityWidget: React.FC<{ offer: ReciprocityOffer; onClaim: () => void }> = ({ offer, onClaim }) => {
  const [timeLeft, setTimeLeft] = useState(offer.timeLimit || 0);

  useEffect(() => {
    if (offer.timeLimit) {
      const interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [offer.timeLimit]);

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getIcon = () => {
    switch (offer.type) {
      case 'consultation': return <Phone className="w-6 h-6" />;
      case 'free_value': return <Gift className="w-6 h-6" />;
      case 'discount': return <Percent className="w-6 h-6" />;
      case 'trial': return <Clock className="w-6 h-6" />;
      case 'bonus': return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-3xl p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{offer.title}</h3>
          <p className="text-white/80 mb-3">{offer.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-green-400 font-semibold">{offer.value}</div>
            {offer.timeLimit && timeLeft > 0 && (
              <div className="text-orange-400 text-sm">
                Expires in {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!offer.claimed && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClaim}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
        >
          Claim Now - No Obligation
        </motion.button>
      )}
      
      {offer.claimed && (
        <div className="w-full mt-4 bg-green-500/20 border border-green-400/30 text-green-400 font-semibold py-3 px-6 rounded-2xl text-center">
          ✓ Claimed! Check your email for details
        </div>
      )}
    </motion.div>
  );
};

const CommitmentBuilder: React.FC<{ device: CommitmentDevice; onCommit: (commitment: string) => void }> = ({ device, onCommit }) => {
  const [committed, setCommitted] = useState(false);

  const handleCommit = () => {
    setCommitted(true);
    onCommit(device.commitment);
  };

  const getIcon = () => {
    switch (device.type) {
      case 'preference': return <Heart className="w-5 h-5" />;
      case 'goal': return <Target className="w-5 h-5" />;
      case 'social': return <Share2 className="w-5 h-5" />;
      case 'investment': return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-2">{device.action}</h4>
          
          {!committed ? (
            <>
              <p className="text-white/70 text-sm mb-3">{device.commitment}</p>
              <button
                onClick={handleCommit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Yes, I commit to this
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Commitment made!</span>
              </div>
              <p className="text-white/80 text-sm">{device.reinforcement}</p>
              {device.publicVisible && (
                <div className="text-blue-400 text-xs">
                  ✓ Shared with community for accountability
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AuthorityIndicator: React.FC = () => {
  const authorities = [
    { name: 'Better Business Bureau', rating: 'A+', icon: Award },
    { name: 'Angie\'s List', rating: 'Super Service', icon: Star },
    { name: 'HomeAdvisor', rating: 'Elite Service', icon: Crown },
    { name: 'Google Reviews', rating: '4.9/5', icon: ThumbsUp }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {authorities.map((authority, index) => (
        <motion.div
          key={authority.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
        >
          <authority.icon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-white font-semibold text-sm">{authority.name}</div>
          <div className="text-yellow-400 text-xs">{authority.rating}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default function ConversionPsychologyEngine() {
  const [activeScarcity, setActiveScarcity] = useState(0);
  const [claimedOffers, setClaimedOffers] = useState<Set<string>>(new Set());
  const [commitments, setCommitments] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScarcity(prev => (prev + 1) % scarcityTriggers.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimOffer = (offerTitle: string) => {
    setClaimedOffers(prev => new Set([...prev, offerTitle]));
  };

  const handleCommitment = (commitment: string) => {
    setCommitments(prev => [...prev, commitment]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Conversion Psychology
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Advanced psychological triggers and behavioral science principles 
            that ethically guide users toward confident decision-making.
          </p>
        </motion.div>

        {/* Scarcity Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Timer className="w-6 h-6 mr-3" />
            Scarcity & Urgency (Natural & Ethical)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scarcityTriggers.map((trigger, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ScarcityIndicator trigger={trigger} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-3" />
            Social Proof & Validation
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Live Activity Feed</h3>
              <SocialProofTicker elements={socialProofElements} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Authority & Credibility</h3>
              <AuthorityIndicator />
            </div>
          </div>
        </motion.div>

        {/* Trust Signals Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3" />
            Trust Building & Risk Reduction
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustSignals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrustBadge signal={signal} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Reciprocity Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-3" />
            Reciprocity & Value-First Approach
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reciprocityOffers.map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                <ReciprocityWidget
                  offer={{
                    ...offer,
                    claimed: claimedOffers.has(offer.title)
                  }}
                  onClaim={() => handleClaimOffer(offer.title)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Commitment & Consistency Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-3" />
            Commitment & Consistency Building
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commitmentDevices.map((device, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CommitmentBuilder
                  device={device}
                  onCommit={handleCommitment}
                />
              </motion.div>
            ))}
          </div>
          
          {commitments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-green-500/10 border border-green-400/30 rounded-2xl p-6"
            >
              <h3 className="text-green-400 font-semibold mb-3">Your Commitments</h3>
              <div className="space-y-2">
                {commitments.map((commitment, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white/80">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{commitment}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Psychology Principles Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-card p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Brain className="w-6 h-6 mr-3" />
            Psychological Principles in Action
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                principle: 'Scarcity',
                description: 'Creates urgency through genuine limitations',
                example: 'Limited contractor availability',
                ethical: true
              },
              {
                principle: 'Social Proof',
                description: 'Shows others\' positive experiences',
                example: 'Real customer activity and testimonials',
                ethical: true
              },
              {
                principle: 'Authority',
                description: 'Establishes credibility through credentials',
                example: 'Professional certifications and ratings',
                ethical: true
              },
              {
                principle: 'Reciprocity',
                description: 'Provides value before asking for commitment',
                example: 'Free consultations and helpful guides',
                ethical: true
              },
              {
                principle: 'Commitment',
                description: 'Builds consistency through small commitments',
                example: 'Setting preferences and goals',
                ethical: true
              },
              {
                principle: 'Trust',
                description: 'Reduces perceived risk through guarantees',
                example: 'Money-back guarantees and security badges',
                ethical: true
              }
            ].map((item, index) => (
              <motion.div
                key={item.principle}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{item.principle}</h3>
                  {item.ethical && (
                    <div className="w-3 h-3 bg-green-400 rounded-full" title="Ethical implementation" />
                  )}
                </div>
                <p className="text-white/70 text-sm mb-3">{item.description}</p>
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3">
                  <div className="text-blue-400 text-xs font-semibold mb-1">Example:</div>
                  <div className="text-white/80 text-sm">{item.example}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}