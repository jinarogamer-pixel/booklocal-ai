"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building, 
  Shield, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Camera,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Award,
  Eye,
  Loader2
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  completed: boolean;
  required: boolean;
}

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  
  // Business Information
  businessName: string;
  businessType: 'individual' | 'llc' | 'corporation' | 'partnership';
  ein: string;
  businessAddress: string;
  yearsInBusiness: number;
  
  // Professional Information
  licenseNumber: string;
  licenseType: string;
  licenseState: string;
  licenseExpiration: string;
  serviceCategories: string[];
  yearsExperience: number;
  
  // Insurance Information
  hasGeneralLiability: boolean;
  insuranceCarrier: string;
  policyNumber: string;
  coverageAmount: number;
  insuranceExpiration: string;
  
  // Banking Information
  bankAccountType: 'checking' | 'savings';
  routingNumber: string;
  accountNumber: string;
  
  // Documents
  documents: {
    governmentId: File | null;
    businessLicense: File | null;
    insuranceCertificate: File | null;
    w9Form: File | null;
  };
}

// Step 1: Personal Information
function PersonalInfoStep({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-gray-600">We need to verify your identity to ensure platform safety.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="John"
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Smith"
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last 4 digits of SSN *
          </label>
          <input
            type="text"
            maxLength={4}
            value={formData.ssn}
            onChange={(e) => setFormData({...formData, ssn: e.target.value.replace(/\D/g, '')})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1234"
          />
          <p className="text-xs text-gray-500 mt-1">Required for background check and tax reporting</p>
          {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
        </div>
      </div>
    </div>
  );
}

// Step 2: Business Information
function BusinessInfoStep({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Information</h3>
        <p className="text-gray-600">Tell us about your business structure and operations.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData({...formData, businessType: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select business type</option>
            <option value="individual">Individual/Sole Proprietor</option>
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
          {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({...formData, businessName: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ABC Plumbing Services"
          />
          {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
        </div>
        
        {formData.businessType !== 'individual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              EIN (Employer Identification Number) *
            </label>
            <input
              type="text"
              value={formData.ein}
              onChange={(e) => setFormData({...formData, ein: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12-3456789"
            />
            {errors.ein && <p className="text-red-500 text-sm mt-1">{errors.ein}</p>}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <textarea
            value={formData.businessAddress}
            onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="123 Main St, Tampa, FL 33101"
          />
          {errors.businessAddress && <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business *
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.yearsInBusiness}
            onChange={(e) => setFormData({...formData, yearsInBusiness: parseInt(e.target.value) || 0})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5"
          />
          {errors.yearsInBusiness && <p className="text-red-500 text-sm mt-1">{errors.yearsInBusiness}</p>}
        </div>
      </div>
    </div>
  );
}

// Step 3: Professional License
function LicenseInfoStep({ formData, setFormData, errors }: any) {
  const serviceCategories = [
    'Plumbing', 'Electrical', 'HVAC', 'General Contractor', 
    'Roofing', 'Flooring', 'Painting', 'Handyman Services'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional License</h3>
        <p className="text-gray-600">Provide your professional license information for verification.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Number *
          </label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="FL-CFC-123456"
          />
          {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Type *
          </label>
          <input
            type="text"
            value={formData.licenseType}
            onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Certified Plumbing Contractor"
          />
          {errors.licenseType && <p className="text-red-500 text-sm mt-1">{errors.licenseType}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License State *
            </label>
            <select
              value={formData.licenseState}
              onChange={(e) => setFormData({...formData, licenseState: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="AL">Alabama</option>
            </select>
            {errors.licenseState && <p className="text-red-500 text-sm mt-1">{errors.licenseState}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Expiration *
            </label>
            <input
              type="date"
              value={formData.licenseExpiration}
              onChange={(e) => setFormData({...formData, licenseExpiration: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.licenseExpiration && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiration}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Categories *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {serviceCategories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.serviceCategories.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        serviceCategories: [...formData.serviceCategories, category]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        serviceCategories: formData.serviceCategories.filter(c => c !== category)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
          {errors.serviceCategories && <p className="text-red-500 text-sm mt-1">{errors.serviceCategories}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={formData.yearsExperience}
            onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value) || 0})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10"
          />
          {errors.yearsExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsExperience}</p>}
        </div>
      </div>
    </div>
  );
}

// Step 4: Insurance Information
function InsuranceInfoStep({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Insurance Information</h3>
        <p className="text-gray-600">Insurance is required to protect both you and your customers.</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasGeneralLiability"
            checked={formData.hasGeneralLiability}
            onChange={(e) => setFormData({...formData, hasGeneralLiability: e.target.checked})}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="hasGeneralLiability" className="ml-2 text-sm text-gray-700">
            I have General Liability Insurance *
          </label>
        </div>
        
        {formData.hasGeneralLiability && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Carrier *
              </label>
              <input
                type="text"
                value={formData.insuranceCarrier}
                onChange={(e) => setFormData({...formData, insuranceCarrier: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="State Farm, Allstate, etc."
              />
              {errors.insuranceCarrier && <p className="text-red-500 text-sm mt-1">{errors.insuranceCarrier}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number *
              </label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="POL-123456789"
              />
              {errors.policyNumber && <p className="text-red-500 text-sm mt-1">{errors.policyNumber}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Amount *
                </label>
                <select
                  value={formData.coverageAmount}
                  onChange={(e) => setFormData({...formData, coverageAmount: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select coverage amount</option>
                  <option value="300000">$300,000</option>
                  <option value="500000">$500,000</option>
                  <option value="1000000">$1,000,000</option>
                  <option value="2000000">$2,000,000</option>
                </select>
                {errors.coverageAmount && <p className="text-red-500 text-sm mt-1">{errors.coverageAmount}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Expiration *
                </label>
                <input
                  type="date"
                  value={formData.insuranceExpiration}
                  onChange={(e) => setFormData({...formData, insuranceExpiration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.insuranceExpiration && <p className="text-red-500 text-sm mt-1">{errors.insuranceExpiration}</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Step 5: Banking Information
function BankingInfoStep({ formData, setFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Banking Information</h3>
        <p className="text-gray-600">We need your banking details to send payments securely.</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            Your banking information is encrypted and secure. We use bank-level security.
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type *
          </label>
          <select
            value={formData.bankAccountType}
            onChange={(e) => setFormData({...formData, bankAccountType: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select account type</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
          {errors.bankAccountType && <p className="text-red-500 text-sm mt-1">{errors.bankAccountType}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Routing Number *
          </label>
          <input
            type="text"
            value={formData.routingNumber}
            onChange={(e) => setFormData({...formData, routingNumber: e.target.value.replace(/\D/g, '')})}
            maxLength={9}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123456789"
          />
          {errors.routingNumber && <p className="text-red-500 text-sm mt-1">{errors.routingNumber}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1234567890"
          />
          {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
        </div>
      </div>
    </div>
  );
}

// Step 6: Document Upload
function DocumentUploadStep({ formData, setFormData, errors }: any) {
  const handleFileUpload = (documentType: string, file: File) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [documentType]: file
      }
    });
  };

  const FileUploadField = ({ 
    documentType, 
    title, 
    description, 
    required = false 
  }: {
    documentType: string;
    title: string;
    description: string;
    required?: boolean;
  }) => (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{title} {required && '*'}</h4>
        {formData.documents[documentType] && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      
      <div className="flex items-center space-x-3">
        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-4 h-4 mr-2" />
          <span className="text-sm">Upload File</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(documentType, file);
            }}
            className="hidden"
          />
        </label>
        
        {formData.documents[documentType] && (
          <span className="text-sm text-gray-600">
            {formData.documents[documentType].name}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Upload</h3>
        <p className="text-gray-600">Upload required documents for verification.</p>
      </div>
      
      <div className="space-y-4">
        <FileUploadField
          documentType="governmentId"
          title="Government-Issued ID"
          description="Driver's license, passport, or state ID (front and back)"
          required
        />
        
        <FileUploadField
          documentType="businessLicense"
          title="Business License"
          description="Your professional license or business registration"
          required
        />
        
        <FileUploadField
          documentType="insuranceCertificate"
          title="Insurance Certificate"
          description="Certificate of liability insurance"
          required
        />
        
        <FileUploadField
          documentType="w9Form"
          title="W-9 Tax Form"
          description="Completed W-9 form for tax reporting"
        />
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Document Requirements</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• All documents must be clear and legible</li>
              <li>• Accepted formats: PDF, JPG, PNG</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Documents must be current and not expired</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Onboarding Component
export default function ProviderOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    businessName: '',
    businessType: 'individual',
    ein: '',
    businessAddress: '',
    yearsInBusiness: 0,
    licenseNumber: '',
    licenseType: '',
    licenseState: '',
    licenseExpiration: '',
    serviceCategories: [],
    yearsExperience: 0,
    hasGeneralLiability: false,
    insuranceCarrier: '',
    policyNumber: '',
    coverageAmount: 0,
    insuranceExpiration: '',
    bankAccountType: 'checking',
    routingNumber: '',
    accountNumber: '',
    documents: {
      governmentId: null,
      businessLicense: null,
      insuranceCertificate: null,
      w9Form: null
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details',
      component: PersonalInfoStep,
      completed: false,
      required: true
    },
    {
      id: 'business',
      title: 'Business Information',
      description: 'Business structure and details',
      component: BusinessInfoStep,
      completed: false,
      required: true
    },
    {
      id: 'license',
      title: 'Professional License',
      description: 'License and service information',
      component: LicenseInfoStep,
      completed: false,
      required: true
    },
    {
      id: 'insurance',
      title: 'Insurance',
      description: 'Insurance coverage details',
      component: InsuranceInfoStep,
      completed: false,
      required: true
    },
    {
      id: 'banking',
      title: 'Banking',
      description: 'Payment information',
      component: BankingInfoStep,
      completed: false,
      required: true
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Upload verification documents',
      component: DocumentUploadStep,
      completed: false,
      required: true
    }
  ];

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: any = {};
    
    switch (stepIndex) {
      case 0: // Personal Information
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.ssn || formData.ssn.length !== 4) newErrors.ssn = 'Last 4 digits of SSN required';
        break;
        
      case 1: // Business Information
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (formData.businessType !== 'individual' && !formData.ein) {
          newErrors.ein = 'EIN is required for business entities';
        }
        if (!formData.businessAddress) newErrors.businessAddress = 'Business address is required';
        break;
        
      case 2: // License Information
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseType) newErrors.licenseType = 'License type is required';
        if (!formData.licenseState) newErrors.licenseState = 'License state is required';
        if (!formData.licenseExpiration) newErrors.licenseExpiration = 'License expiration is required';
        if (formData.serviceCategories.length === 0) {
          newErrors.serviceCategories = 'At least one service category is required';
        }
        break;
        
      case 3: // Insurance Information
        if (!formData.hasGeneralLiability) {
          newErrors.hasGeneralLiability = 'General liability insurance is required';
        } else {
          if (!formData.insuranceCarrier) newErrors.insuranceCarrier = 'Insurance carrier is required';
          if (!formData.policyNumber) newErrors.policyNumber = 'Policy number is required';
          if (!formData.coverageAmount) newErrors.coverageAmount = 'Coverage amount is required';
          if (!formData.insuranceExpiration) newErrors.insuranceExpiration = 'Insurance expiration is required';
        }
        break;
        
      case 4: // Banking Information
        if (!formData.bankAccountType) newErrors.bankAccountType = 'Account type is required';
        if (!formData.routingNumber || formData.routingNumber.length !== 9) {
          newErrors.routingNumber = 'Valid 9-digit routing number is required';
        }
        if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
        break;
        
      case 5: // Documents
        if (!formData.documents.governmentId) newErrors.governmentId = 'Government ID is required';
        if (!formData.documents.businessLicense) newErrors.businessLicense = 'Business license is required';
        if (!formData.documents.insuranceCertificate) {
          newErrors.insuranceCertificate = 'Insurance certificate is required';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual API submission
      // This would include:
      // 1. Upload documents to secure storage
      // 2. Submit data to backend for processing
      // 3. Trigger background checks and verifications
      // 4. Create Stripe Connect account
      // 5. Send confirmation emails
      
      console.log('Submitting onboarding data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert('Application submitted successfully! We\'ll review your information and contact you within 2 business days.');
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become a BookLocal Provider
          </h1>
          <p className="text-lg text-gray-600">
            Join our network of trusted, verified contractors
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    index < currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : index === currentStep
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <CurrentStepComponent
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-medium ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
