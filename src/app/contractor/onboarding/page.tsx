"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  User,
  Building,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Award,
  Camera,
  Download
} from 'lucide-react';
import { verificationService } from '@/lib/verification';
import { supabase } from '@/lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
}

export default function ContractorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    
    // Business Information
    business_name: '',
    business_type: 'individual',
    ein: '',
    years_experience: '',
    
    // Address Information
    street_address: '',
    city: '',
    state: 'FL',
    zip_code: '',
    
    // License Information
    license_number: '',
    license_type: '',
    license_state: 'FL',
    
    // Service Information
    service_categories: [] as string[],
    service_radius: 25,
    hourly_rate: '',
    minimum_job_size: '',
    
    // Insurance Information
    insurance_carrier: '',
    insurance_policy: '',
    insurance_amount: '',
    insurance_expiry: ''
  });

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Basic personal details and contact information',
      status: 'in_progress',
      required: true
    },
    {
      id: 'business_info',
      title: 'Business Information',
      description: 'Business details and experience',
      status: 'pending',
      required: true
    },
    {
      id: 'license_verification',
      title: 'License Verification',
      description: 'Verify your professional licenses',
      status: 'pending',
      required: true
    },
    {
      id: 'identity_verification',
      title: 'Identity Verification',
      description: 'Government ID verification',
      status: 'pending',
      required: true
    },
    {
      id: 'background_check',
      title: 'Background Check',
      description: 'Professional background screening',
      status: 'pending',
      required: true
    },
    {
      id: 'insurance_verification',
      title: 'Insurance Verification',
      description: 'Upload and verify insurance certificates',
      status: 'pending',
      required: true
    },
    {
      id: 'service_setup',
      title: 'Service Setup',
      description: 'Configure your services and pricing',
      status: 'pending',
      required: true
    },
    {
      id: 'final_review',
      title: 'Final Review',
      description: 'Review and submit your application',
      status: 'pending',
      required: true
    }
  ]);

  useEffect(() => {
    // Get contractor ID from session or create new profile
    initializeContractor();
  }, []);

  const initializeContractor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if contractor profile exists
        const { data: profile } = await supabase
          .from('contractor_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setContractorId(profile.id);
          // Load verification status
          const status = await verificationService.getVerificationStatus(profile.id);
          setVerificationStatus(status);
        }
      }
    } catch (error) {
      console.error('Error initializing contractor:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    setLoading(true);
    
    try {
      const stepId = steps[currentStep].id;
      
      switch (stepId) {
        case 'personal_info':
          await handlePersonalInfoSubmit();
          break;
        case 'business_info':
          await handleBusinessInfoSubmit();
          break;
        case 'license_verification':
          await handleLicenseVerification();
          break;
        case 'identity_verification':
          await handleIdentityVerification();
          break;
        case 'background_check':
          await handleBackgroundCheck();
          break;
        case 'insurance_verification':
          await handleInsuranceVerification();
          break;
        case 'service_setup':
          await handleServiceSetup();
          break;
        case 'final_review':
          await handleFinalSubmission();
          break;
      }
      
      // Update step status and move to next
      updateStepStatus(currentStep, 'completed');
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        updateStepStatus(currentStep + 1, 'in_progress');
      }
    } catch (error) {
      console.error('Error processing step:', error);
      updateStepStatus(currentStep, 'failed');
    } finally {
      setLoading(false);
    }
  };

  const updateStepStatus = (stepIndex: number, status: OnboardingStep['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ));
  };

  const handlePersonalInfoSubmit = async () => {
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      throw new Error('Please fill in all required personal information');
    }
    
    // Create or update user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          user_type: 'contractor'
        })
        .eq('id', user.id);
    }
  };

  const handleBusinessInfoSubmit = async () => {
    // Validate business information
    if (!formData.business_name || !formData.years_experience) {
      throw new Error('Please fill in all required business information');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Create or update contractor profile
      const { data: profile } = await supabase
        .from('contractor_profiles')
        .upsert({
          user_id: user.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          ein: formData.ein,
          years_experience: parseInt(formData.years_experience),
          service_radius: formData.service_radius,
          hourly_rate: parseFloat(formData.hourly_rate) || null,
          minimum_job_size: parseFloat(formData.minimum_job_size) || null
        })
        .select()
        .single();
      
      if (profile) {
        setContractorId(profile.id);
      }
    }
  };

  const handleLicenseVerification = async () => {
    if (!contractorId) throw new Error('Contractor profile not found');
    
    if (formData.license_number) {
      // Update contractor profile with license info
      await supabase
        .from('contractor_profiles')
        .update({
          license_number: formData.license_number,
          license_type: formData.license_type,
          license_state: formData.license_state
        })
        .eq('id', contractorId);
      
      // Verify license through Florida DBPR
      const { floridaLicenseVerification } = await import('@/lib/verification');
      const verification = await floridaLicenseVerification.verifyLicense(
        formData.license_number,
        formData.license_type
      );
      
      if (verification && verification.status === 'active') {
        await supabase
          .from('contractor_profiles')
          .update({
            license_verified: true,
            license_verified_at: new Date().toISOString(),
            license_expires_at: verification.expires_at
          })
          .eq('id', contractorId);
      }
    }
  };

  const handleIdentityVerification = async () => {
    if (!contractorId) throw new Error('Contractor profile not found');
    
    // Start Jumio verification
    const result = await verificationService.startContractorVerification(contractorId, {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      zipcode: formData.zip_code,
      dob: formData.date_of_birth,
      license_number: formData.license_number,
      license_type: formData.license_type
    });
    
    if (result.success && result.results.identity_verification?.redirectUrl) {
      // Redirect to Jumio verification
      window.open(result.results.identity_verification.redirectUrl, '_blank');
    }
  };

  const handleBackgroundCheck = async () => {
    if (!contractorId) throw new Error('Contractor profile not found');
    
    // Background check was already initiated in identity verification step
    // This step just confirms it's in progress
    console.log('Background check initiated');
  };

  const handleInsuranceVerification = async () => {
    if (!contractorId) throw new Error('Contractor profile not found');
    
    if (formData.insurance_carrier && formData.insurance_policy) {
      const { insuranceVerification } = await import('@/lib/verification');
      await insuranceVerification.verifyInsurance(contractorId, {
        carrier_name: formData.insurance_carrier,
        policy_number: formData.insurance_policy,
        coverage_type: 'general_liability',
        coverage_amount: parseFloat(formData.insurance_amount),
        effective_date: new Date().toISOString().split('T')[0],
        expiration_date: formData.insurance_expiry
      });
    }
  };

  const handleServiceSetup = async () => {
    if (!contractorId) throw new Error('Contractor profile not found');
    
    // Add contractor services
    if (formData.service_categories.length > 0) {
      const services = formData.service_categories.map(category => ({
        contractor_id: contractorId,
        service_category: category,
        hourly_rate: parseFloat(formData.hourly_rate) || null,
        minimum_charge: parseFloat(formData.minimum_job_size) || null,
        is_primary: category === formData.service_categories[0]
      }));
      
      await supabase
        .from('contractor_services')
        .insert(services);
    }
  };

  const handleFinalSubmission = async () => {
    if (!contractorId) throw new Error('Contractor profile not found');
    
    // Update contractor status to pending approval
    await supabase
      .from('contractor_profiles')
      .update({
        availability_status: 'unavailable' // Will be set to available after approval
      })
      .eq('id', contractorId);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'personal_info':
        return <PersonalInfoForm formData={formData} onChange={handleInputChange} />;
      case 'business_info':
        return <BusinessInfoForm formData={formData} onChange={handleInputChange} />;
      case 'license_verification':
        return <LicenseVerificationForm formData={formData} onChange={handleInputChange} />;
      case 'identity_verification':
        return <IdentityVerificationForm />;
      case 'background_check':
        return <BackgroundCheckForm />;
      case 'insurance_verification':
        return <InsuranceVerificationForm formData={formData} onChange={handleInputChange} />;
      case 'service_setup':
        return <ServiceSetupForm formData={formData} onChange={handleInputChange} />;
      case 'final_review':
        return <FinalReviewForm formData={formData} verificationStatus={verificationStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Contractor Onboarding
          </h1>
          <p className="text-lg text-gray-600">
            Complete your verification to start receiving job requests
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                    step.status === 'failed' ? 'bg-red-500 text-white' :
                    'bg-gray-300 text-gray-600'}
                `}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : step.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-1 mx-2
                    ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === steps.length - 1 ? (
              'Submit Application'
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Form Components
function PersonalInfoForm({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => onChange('first_name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => onChange('last_name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Privacy Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your personal information is encrypted and used only for verification purposes. 
              We comply with all Florida privacy laws and never share your data without consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessInfoForm({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => onChange('business_name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Business Name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            value={formData.business_type}
            onChange={(e) => onChange('business_type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="individual">Individual/Sole Proprietor</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            EIN (if applicable)
          </label>
          <input
            type="text"
            value={formData.ein}
            onChange={(e) => onChange('ein', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="XX-XXXXXXX"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={formData.years_experience}
            onChange={(e) => onChange('years_experience', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="50"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Radius (miles)
          </label>
          <input
            type="number"
            value={formData.service_radius}
            onChange={(e) => onChange('service_radius', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="5"
            max="100"
          />
        </div>
      </div>
    </div>
  );
}

function LicenseVerificationForm({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Florida License Number
          </label>
          <input
            type="text"
            value={formData.license_number}
            onChange={(e) => onChange('license_number', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., CGC1234567"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Type
          </label>
          <select
            value={formData.license_type}
            onChange={(e) => onChange('license_type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select License Type</option>
            <option value="General Contractor">General Contractor</option>
            <option value="Electrical Contractor">Electrical Contractor</option>
            <option value="Plumbing Contractor">Plumbing Contractor</option>
            <option value="HVAC Contractor">HVAC Contractor</option>
            <option value="Roofing Contractor">Roofing Contractor</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">License Information</h4>
            <p className="text-sm text-yellow-700 mt-1">
              If you don't have a Florida contractor license, you can still join for jobs under $1,000 
              (per Florida Statute 489.103). Licensed contractors get priority for larger projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IdentityVerificationForm() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Camera className="w-12 h-12 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Identity Verification Required
        </h3>
        <p className="text-gray-600">
          We'll verify your identity using government-issued ID through our secure partner Jumio.
          This process takes just a few minutes and helps keep our platform safe.
        </p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
          <div className="text-left">
            <h4 className="text-sm font-medium text-green-900">What You'll Need</h4>
            <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
              <li>Valid driver's license or state ID</li>
              <li>Good lighting for clear photos</li>
              <li>About 2-3 minutes to complete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackgroundCheckForm() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <FileText className="w-12 h-12 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Background Check in Progress
        </h3>
        <p className="text-gray-600">
          We're running a comprehensive background check through Checkr. 
          This typically takes 1-3 business days to complete.
        </p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div className="text-left">
            <h4 className="text-sm font-medium text-blue-900">What We Check</h4>
            <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
              <li>Criminal history</li>
              <li>Sex offender registry</li>
              <li>Professional references</li>
              <li>Employment verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsuranceVerificationForm({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Carrier *
          </label>
          <input
            type="text"
            value={formData.insurance_carrier}
            onChange={(e) => onChange('insurance_carrier', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., State Farm, Allstate"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policy Number *
          </label>
          <input
            type="text"
            value={formData.insurance_policy}
            onChange={(e) => onChange('insurance_policy', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coverage Amount *
          </label>
          <select
            value={formData.insurance_amount}
            onChange={(e) => onChange('insurance_amount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Coverage Amount</option>
            <option value="300000">$300,000</option>
            <option value="500000">$500,000</option>
            <option value="1000000">$1,000,000</option>
            <option value="2000000">$2,000,000</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date *
          </label>
          <input
            type="date"
            value={formData.insurance_expiry}
            onChange={(e) => onChange('insurance_expiry', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-900">Upload Insurance Certificate</h4>
          <p className="text-sm text-gray-500">PDF or image files up to 10MB</p>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Choose File
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceSetupForm({ formData, onChange }: any) {
  const serviceCategories = [
    'Plumbing', 'Electrical', 'HVAC', 'Handyman', 'Painting', 
    'Flooring', 'Roofing', 'Landscaping'
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Services Offered *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {serviceCategories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.service_categories.includes(category)}
                onChange={(e) => {
                  const categories = e.target.checked
                    ? [...formData.service_categories, category]
                    : formData.service_categories.filter((c: string) => c !== category);
                  onChange('service_categories', categories);
                }}
                className="mr-2"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            value={formData.hourly_rate}
            onChange={(e) => onChange('hourly_rate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
            placeholder="50.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Job Size ($)
          </label>
          <input
            type="number"
            value={formData.minimum_job_size}
            onChange={(e) => onChange('minimum_job_size', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
            placeholder="100.00"
          />
        </div>
      </div>
    </div>
  );
}

function FinalReviewForm({ formData, verificationStatus }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Application Review
        </h3>
        <p className="text-gray-600">
          Please review your information before submitting your contractor application.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
          <p className="text-sm text-gray-600">
            {formData.first_name} {formData.last_name}<br />
            {formData.email}<br />
            {formData.phone}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
          <p className="text-sm text-gray-600">
            {formData.business_name}<br />
            {formData.years_experience} years experience<br />
            {formData.service_radius} mile radius
          </p>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Ready to Submit</h4>
            <p className="text-sm text-green-700 mt-1">
              Your application will be reviewed within 2-3 business days. 
              You'll receive an email notification once approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}