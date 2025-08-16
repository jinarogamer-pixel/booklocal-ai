"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Clock, 
  MapPin, 
  Star, 
  Zap,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  ChevronRight,
  CheckCircle,
  Award,
  Shield,
  Briefcase,
  Settings,
  BarChart3,
  Globe,
  Lightbulb
} from 'lucide-react';

interface Contractor {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  completedJobs: number;
  skills: Skill[];
  location: { lat: number; lng: number; address: string };
  hourlyRate: number;
  availability: AvailabilitySlot[];
  verificationLevel: 'basic' | 'professional' | 'premium' | 'enterprise';
  specialties: string[];
  responseTime: string;
  distance: number;
  matchScore: number;
}

interface Skill {
  name: string;
  proficiency: number; // 1-100
  yearsExperience: number;
  certifications: string[];
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface MatchingCriteria {
  skillRequirements: string[];
  budget: { min: number; max: number };
  location: { lat: number; lng: number; radius: number };
  timeframe: string;
  projectType: string;
  urgency: 'low' | 'medium' | 'high';
  qualityPreference: 'budget' | 'balanced' | 'premium';
}

const mockContractors: Contractor[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    rating: 4.9,
    completedJobs: 247,
    skills: [
      { name: 'Plumbing', proficiency: 95, yearsExperience: 8, certifications: ['Master Plumber', 'Gas Line Certified'] },
      { name: 'Emergency Repairs', proficiency: 90, yearsExperience: 8, certifications: ['24/7 Emergency'] }
    ],
    location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
    hourlyRate: 85,
    availability: [],
    verificationLevel: 'premium',
    specialties: ['Emergency Plumbing', 'Pipe Installation', 'Water Heater Repair'],
    responseTime: '< 15 min',
    distance: 2.3,
    matchScore: 98
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'MC',
    rating: 4.8,
    completedJobs: 189,
    skills: [
      { name: 'Electrical Work', proficiency: 92, yearsExperience: 6, certifications: ['Licensed Electrician', 'Solar Installation'] },
      { name: 'Smart Home Setup', proficiency: 88, yearsExperience: 4, certifications: ['Google Nest Pro'] }
    ],
    location: { lat: 37.7849, lng: -122.4094, address: 'San Francisco, CA' },
    hourlyRate: 75,
    availability: [],
    verificationLevel: 'professional',
    specialties: ['Smart Home', 'Electrical Panels', 'LED Installation'],
    responseTime: '< 30 min',
    distance: 1.8,
    matchScore: 94
  },
  {
    id: '3',
    name: 'David Rodriguez',
    avatar: 'DR',
    rating: 4.95,
    completedJobs: 312,
    skills: [
      { name: 'General Contracting', proficiency: 97, yearsExperience: 12, certifications: ['General Contractor License', 'OSHA Certified'] },
      { name: 'Project Management', proficiency: 94, yearsExperience: 10, certifications: ['PMP Certified'] }
    ],
    location: { lat: 37.7649, lng: -122.4294, address: 'San Francisco, CA' },
    hourlyRate: 120,
    availability: [],
    verificationLevel: 'enterprise',
    specialties: ['Large Projects', 'Team Management', 'Permits & Licensing'],
    responseTime: '< 1 hour',
    distance: 3.1,
    matchScore: 91
  }
];

export default function IntelligentMatchingSystem() {
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({
    skillRequirements: ['Plumbing'],
    budget: { min: 50, max: 150 },
    location: { lat: 37.7749, lng: -122.4194, radius: 10 },
    timeframe: 'this_week',
    projectType: 'repair',
    urgency: 'medium',
    qualityPreference: 'balanced'
  });

  const [matchedContractors, setMatchedContractors] = useState<Contractor[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [showMatchingProcess, setShowMatchingProcess] = useState(false);

  const matchingSteps = [
    { id: 'analyzing', title: 'Analyzing Requirements', description: 'Processing your project needs and preferences' },
    { id: 'searching', title: 'Searching Database', description: 'Scanning 50,000+ verified contractors' },
    { id: 'scoring', title: 'AI Scoring', description: 'Calculating compatibility scores using ML algorithms' },
    { id: 'optimizing', title: 'Optimizing Results', description: 'Considering location, availability, and pricing' },
    { id: 'ranking', title: 'Final Ranking', description: 'Presenting best matches based on your criteria' }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handleMatch = async () => {
    setIsMatching(true);
    setShowMatchingProcess(true);
    setCurrentStep(0);

    // Simulate AI matching process
    for (let i = 0; i < matchingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Sort contractors by match score
    const sorted = [...mockContractors].sort((a, b) => b.matchScore - a.matchScore);
    setMatchedContractors(sorted);
    setIsMatching(false);
  };

  const getVerificationBadge = (level: string) => {
    const badges = {
      basic: { color: 'from-gray-500 to-gray-600', text: 'Basic' },
      professional: { color: 'from-blue-500 to-blue-600', text: 'Pro' },
      premium: { color: 'from-purple-500 to-purple-600', text: 'Premium' },
      enterprise: { color: 'from-yellow-500 to-yellow-600', text: 'Enterprise' }
    };
    return badges[level as keyof typeof badges] || badges.basic;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 90) return 'text-blue-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-gray-400';
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
              AI-Powered Matching
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Our advanced machine learning algorithm analyzes 50+ factors to find the perfect contractor 
            for your project in seconds.
          </p>
        </motion.div>

        {/* Matching Criteria Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 rounded-3xl mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3" />
            Project Requirements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Skills Required */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Skills Required</label>
              <div className="space-y-2">
                {['Plumbing', 'Electrical', 'HVAC', 'General Repair'].map(skill => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={matchingCriteria.skillRequirements.includes(skill)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMatchingCriteria(prev => ({
                            ...prev,
                            skillRequirements: [...prev.skillRequirements, skill]
                          }));
                        } else {
                          setMatchingCriteria(prev => ({
                            ...prev,
                            skillRequirements: prev.skillRequirements.filter(s => s !== skill)
                          }));
                        }
                      }}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-white/80 text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Budget Range</label>
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs">Min: ${matchingCriteria.budget.min}/hr</label>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    value={matchingCriteria.budget.min}
                    onChange={(e) => setMatchingCriteria(prev => ({
                      ...prev,
                      budget: { ...prev.budget, min: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs">Max: ${matchingCriteria.budget.max}/hr</label>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    value={matchingCriteria.budget.max}
                    onChange={(e) => setMatchingCriteria(prev => ({
                      ...prev,
                      budget: { ...prev.budget, max: parseInt(e.target.value) }
                    }))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Timeframe</label>
              <select
                value={matchingCriteria.timeframe}
                onChange={(e) => setMatchingCriteria(prev => ({ ...prev, timeframe: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="asap">ASAP</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="next_week">Next Week</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Quality Preference */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">Quality Preference</label>
              <div className="space-y-2">
                {[
                  { value: 'budget', label: 'Budget-Friendly', icon: DollarSign },
                  { value: 'balanced', label: 'Balanced', icon: Target },
                  { value: 'premium', label: 'Premium Quality', icon: Award }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="quality"
                      value={option.value}
                      checked={matchingCriteria.qualityPreference === option.value}
                      onChange={(e) => setMatchingCriteria(prev => ({ ...prev, qualityPreference: e.target.value as any }))}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <option.icon className="w-4 h-4 text-white/60" />
                    <span className="text-white/80 text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleMatch}
            disabled={isMatching}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-quantum mt-6 flex items-center space-x-3 mx-auto"
          >
            <Brain className="w-5 h-5" />
            <span>{isMatching ? 'Finding Matches...' : 'Find Perfect Match'}</span>
            {!isMatching && <ChevronRight className="w-5 h-5" />}
          </motion.button>
        </motion.div>

        {/* Matching Process Visualization */}
        <AnimatePresence>
          {showMatchingProcess && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-card p-8 rounded-3xl mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
                AI Matching Process
              </h3>

              <div className="space-y-4">
                {matchingSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-500 ${
                      index < currentStep ? 'bg-green-500/20 border border-green-400/30' :
                      index === currentStep ? 'bg-blue-500/20 border border-blue-400/30' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStep ? 'bg-green-500' :
                      index === currentStep ? 'bg-blue-500' :
                      'bg-white/20'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : index === currentStep ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : (
                        <div className="w-3 h-3 bg-white/40 rounded-full" />
                      )}
                    </div>
                    
                    <div>
                      <div className="text-white font-semibold">{step.title}</div>
                      <div className="text-white/70 text-sm">{step.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Matched Contractors */}
        {matchedContractors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Target className="w-8 h-8 mr-3 text-green-400" />
              Perfect Matches Found
              <span className="ml-3 text-lg text-green-400">({matchedContractors.length} contractors)</span>
            </h2>

            {matchedContractors.map((contractor, index) => (
              <motion.div
                key={contractor.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 rounded-3xl magnetic-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                      {contractor.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{contractor.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getVerificationBadge(contractor.verificationLevel).color} text-white`}>
                          {getVerificationBadge(contractor.verificationLevel).text}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="text-white font-semibold">{contractor.rating}</span>
                          <span className="text-white/60">({contractor.completedJobs} jobs)</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <span className="text-white/80">{contractor.distance} miles away</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-white/80">Responds {contractor.responseTime}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {contractor.skills.slice(0, 3).map((skill, idx) => (
                          <div key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                            {skill.name} ({skill.proficiency}%)
                          </div>
                        ))}
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2">
                        {contractor.specialties.slice(0, 3).map((specialty, idx) => (
                          <div key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match Score & Actions */}
                  <div className="text-right">
                    <div className="mb-4">
                      <div className="text-3xl font-black text-white mb-1">
                        <span className={getMatchScoreColor(contractor.matchScore)}>
                          {contractor.matchScore}%
                        </span>
                      </div>
                      <div className="text-white/60 text-sm">Match Score</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-white">${contractor.hourlyRate}/hr</div>
                      <div className="text-white/60 text-sm">Hourly Rate</div>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-quantum w-full"
                      >
                        Book Now
                      </motion.button>
                      
                      <button className="w-full glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}