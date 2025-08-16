"use client";
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Award,
  User,
  Building,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
  icon: React.ElementType;
}

interface VerificationLevel {
  id: string;
  name: string;
  description: string;
  badge: string;
  color: string;
  requirements: string[];
  benefits: string[];
}

const verificationLevels: VerificationLevel[] = [
  {
    id: 'basic',
    name: 'Basic Verification',
    description: 'Essential identity and contact verification',
    badge: 'Basic',
    color: 'from-gray-500 to-gray-600',
    requirements: ['Government ID', 'Phone verification', 'Email verification'],
    benefits: ['Profile visibility', 'Basic booking access', 'Standard support']
  },
  {
    id: 'professional',
    name: 'Professional Verification',
    description: 'Professional credentials and background checks',
    badge: 'Pro',
    color: 'from-blue-500 to-blue-600',
    requirements: ['Professional license', 'Insurance certificate', 'Background check'],
    benefits: ['Priority listing', 'Higher booking rates', 'Professional badge', 'Priority support']
  },
  {
    id: 'premium',
    name: 'Premium Verification',
    description: 'Complete verification with skill assessment',
    badge: 'Premium',
    color: 'from-purple-500 to-purple-600',
    requirements: ['All professional checks', 'Skill assessment', 'Reference verification'],
    benefits: ['Top search results', 'Premium pricing', 'Exclusive projects', 'Dedicated support']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Contractor',
    description: 'Full business verification for enterprise clients',
    badge: 'Enterprise',
    color: 'from-gold-500 to-yellow-600',
    requirements: ['Business registration', 'Bonding certificate', 'Enterprise insurance', 'Team verification'],
    benefits: ['Enterprise project access', 'White-label opportunities', 'API access', 'Account manager']
  }
];

export default function ContractorVerificationSystem() {
  const [currentLevel, setCurrentLevel] = useState<string>('basic');
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    { id: 'identity', title: 'Identity Verification', description: 'Government ID scanning with OCR', status: 'pending', required: true, icon: User },
    { id: 'phone', title: 'Phone Verification', description: 'SMS verification code', status: 'pending', required: true, icon: Phone },
    { id: 'email', title: 'Email Verification', description: 'Email confirmation link', status: 'pending', required: true, icon: Mail },
    { id: 'license', title: 'Professional License', description: 'License verification via API', status: 'pending', required: false, icon: Award },
    { id: 'insurance', title: 'Insurance Certificate', description: 'Liability insurance validation', status: 'pending', required: false, icon: Shield },
    { id: 'background', title: 'Background Check', description: 'Criminal background screening', status: 'pending', required: false, icon: FileText },
    { id: 'skills', title: 'Skill Assessment', description: 'Industry-specific competency testing', status: 'pending', required: false, icon: Zap },
    { id: 'references', title: 'Reference Verification', description: 'Professional reference checks', status: 'pending', required: false, icon: Building }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string>('identity');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((stepId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [stepId]: file }));
    setVerificationSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status: 'in_progress' }
          : step
      )
    );

    // Simulate processing
    setTimeout(() => {
      setVerificationSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, status: 'completed' }
            : step
        )
      );
    }, 2000);
  }, []);

  const handleStepClick = (stepId: string) => {
    setSelectedStep(stepId);
  };

  const getStepIcon = (step: VerificationStep) => {
    const IconComponent = step.icon;
    const baseClasses = "w-6 h-6";
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-400`} />;
      case 'in_progress':
        return <RefreshCw className={`${baseClasses} text-blue-400 animate-spin`} />;
      case 'failed':
        return <AlertCircle className={`${baseClasses} text-red-400`} />;
      default:
        return <IconComponent className={`${baseClasses} text-gray-400`} />;
    }
  };

  const calculateProgress = () => {
    const completed = verificationSteps.filter(step => step.status === 'completed').length;
    return (completed / verificationSteps.length) * 100;
  };

  const getCurrentLevelData = () => {
    return verificationLevels.find(level => level.id === currentLevel) || verificationLevels[0];
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
              Contractor Verification
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Complete your verification to unlock premium features and gain client trust. 
            Higher verification levels lead to more bookings and better rates.
          </p>
        </motion.div>

        {/* Verification Levels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {verificationLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`glass-card p-6 rounded-3xl cursor-pointer transition-all duration-300 ${
                currentLevel === level.id ? 'ring-2 ring-purple-400 scale-105' : ''
              }`}
              onClick={() => setCurrentLevel(level.id)}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${level.color} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">{level.name}</h3>
              <p className="text-white/70 text-sm text-center mb-4">{level.description}</p>
              
              <div className="space-y-2">
                <div className="text-xs text-white/60 font-semibold">Requirements:</div>
                {level.requirements.slice(0, 2).map((req, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-white/80">{req}</span>
                  </div>
                ))}
                {level.requirements.length > 2 && (
                  <div className="text-xs text-white/60">+{level.requirements.length - 2} more</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-3xl mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Verification Progress</h3>
            <span className="text-2xl font-bold text-white">{Math.round(calculateProgress())}%</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress()}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <div className="mt-4 text-white/70 text-sm">
            {verificationSteps.filter(s => s.status === 'completed').length} of {verificationSteps.length} steps completed
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Steps */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-8 rounded-3xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Verification Steps</h3>
              
              <div className="space-y-4">
                {verificationSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      selectedStep === step.id
                        ? 'border-purple-400 bg-purple-500/10'
                        : step.status === 'completed'
                        ? 'border-green-400/30 bg-green-500/5'
                        : 'border-white/10 bg-white/5'
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStepIcon(step)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                          <div className="flex items-center space-x-2">
                            {step.required && (
                              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                                Required
                              </span>
                            )}
                            {step.status === 'completed' && (
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-white/70 text-sm mt-1">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Upload Panel */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-8 rounded-3xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {verificationSteps.find(s => s.id === selectedStep)?.title || 'Select a Step'}
              </h3>
              
              <AnimatePresence mode="wait">
                {selectedStep && (
                  <motion.div
                    key={selectedStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center mb-6 hover:border-purple-400/50 transition-colors duration-300">
                      <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                      <p className="text-white/80 mb-2">
                        Upload your {verificationSteps.find(s => s.id === selectedStep)?.title.toLowerCase()}
                      </p>
                      <p className="text-white/60 text-sm mb-4">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(selectedStep, file);
                          }
                        }}
                      />
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-quantum flex items-center space-x-2 mx-auto"
                        disabled={isProcessing}
                      >
                        <Camera className="w-5 h-5" />
                        <span>Choose File</span>
                      </button>
                    </div>
                    
                    {uploadedFiles[selectedStep] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <div>
                            <div className="text-white font-semibold">File Uploaded</div>
                            <div className="text-green-300 text-sm">{uploadedFiles[selectedStep].name}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Current Level Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="glass-card p-6 rounded-3xl mt-6"
            >
              <h4 className="text-lg font-bold text-white mb-4">
                {getCurrentLevelData().name} Benefits
              </h4>
              
              <div className="space-y-3">
                {getCurrentLevelData().benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white/80 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}