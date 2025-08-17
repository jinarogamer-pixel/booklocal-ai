"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Shield, 
  DollarSign, 
  Users, 
  Clock,
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Upload
} from 'lucide-react';
import Link from 'next/link';

const serviceTypes = [
  'Plumbing', 'Electrical', 'HVAC', 'Handyman', 'Painting', 
  'Flooring', 'Roofing', 'Landscaping', 'Carpentry', 'Other'
];

const experienceLevels = [
  { value: '1-2', label: '1-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-10', label: '6-10 years' },
  { value: '10+', label: '10+ years' }
];

export default function ContractorSignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    serviceTypes: [] as string[],
    experience: '',
    licenseNumber: '',
    insurance: false,
    serviceAreas: '',
    hourlyRate: '',
    availability: '',
    referralSource: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceTypeToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contractor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Thank you for your interest! We\'ll review your application and contact you within 24 hours to discuss next steps.');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          businessName: '',
          serviceTypes: [],
          experience: '',
          licenseNumber: '',
          insurance: false,
          serviceAreas: '',
          hourlyRate: '',
          availability: '',
          referralSource: ''
        });
      } else {
        alert('Sorry, there was an error submitting your application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Sorry, there was an error submitting your application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="text-2xl font-bold text-blue-600">BookLocal</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Florida's Premier Contractor Network
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with quality customers, grow your business, and get paid faster
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <DollarSign className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Higher Earnings</h3>
              <p className="text-sm text-gray-600">Average 20% increase in monthly revenue</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Quality Leads</h3>
              <p className="text-sm text-gray-600">Pre-screened customers ready to hire</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Clock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
              <p className="text-sm text-gray-600">Less time marketing, more time working</p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply to Join Our Network</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name (if applicable)
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="Smith Plumbing LLC"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Services You Provide *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {serviceTypes.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceTypeToggle(service)}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          formData.serviceTypes.includes(service)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <select
                      required
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    >
                      <option value="">Select experience level</option>
                      {experienceLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Florida License Number (if applicable)
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="e.g., CBC1234567"
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas (Cities/ZIP Codes) *
                  </label>
                  <textarea
                    required
                    value={formData.serviceAreas}
                    onChange={(e) => handleInputChange('serviceAreas', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="e.g., Tampa, Orlando, Clearwater, 33101, 32801..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typical Hourly Rate
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="75"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">This helps us match you with appropriate projects</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability *
                    </label>
                    <select
                      required
                      value={formData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    >
                      <option value="">Select availability</option>
                      <option value="immediate">Available immediately</option>
                      <option value="1-2weeks">Available in 1-2 weeks</option>
                      <option value="1month">Available in 1 month</option>
                      <option value="seasonal">Seasonal availability</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Insurance & Legal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance & Legal</h3>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="insurance"
                    checked={formData.insurance}
                    onChange={(e) => handleInputChange('insurance', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="insurance" className="text-sm text-gray-700">
                    I carry general liability insurance and workers' compensation (if applicable) *
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Proof of insurance will be required during the verification process
                </p>
              </div>

              {/* Referral Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about us?
                </label>
                <select
                  value={formData.referralSource}
                  onChange={(e) => handleInputChange('referralSource', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                >
                  <option value="">Select source</option>
                  <option value="google">Google Search</option>
                  <option value="facebook">Facebook</option>
                  <option value="referral">Referral from another contractor</option>
                  <option value="flyer">Flyer/Advertisement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">What Happens Next?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                    We'll review your application within 24 hours
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                    Background check and license verification (if applicable)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                    Brief phone interview to discuss the platform
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                    Account setup and first lead assignment
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Submit Application
                <CheckCircle className="ml-2 w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How much does it cost to join?</h4>
              <p className="text-gray-600">It's completely free to join our network. We only make money when you do - through a small service fee on completed jobs.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do I get paid?</h4>
              <p className="text-gray-600">We handle all payments through our secure platform. You'll receive payment within 2-3 business days after job completion and customer approval.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What if I don't have a Florida license?</h4>
              <p className="text-gray-600">Many services (like handyman work under $1,000) don't require a license. We'll help match you with appropriate projects based on your qualifications.</p>
            </div>
            
            <div>
              <h4 className="font-semibent text-gray-900 mb-2">Can I choose which jobs to take?</h4>
              <p className="text-gray-600">Absolutely! You have complete control over which leads you respond to and which jobs you accept. No obligations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}