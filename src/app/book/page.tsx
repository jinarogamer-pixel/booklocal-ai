"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Phone,
  Mail,
  Home,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const serviceTypes = [
  { id: 'plumbing', name: 'Plumbing', icon: Wrench, description: 'Pipes, leaks, installations' },
  { id: 'electrical', name: 'Electrical', icon: Zap, description: 'Wiring, outlets, lighting' },
  { id: 'painting', name: 'Painting', icon: Paintbrush, description: 'Interior & exterior painting' },
  { id: 'handyman', name: 'Handyman', icon: Hammer, description: 'General repairs & maintenance' },
  { id: 'hvac', name: 'HVAC', icon: Home, description: 'Heating & air conditioning' },
];

const urgencyLevels = [
  { id: 'low', name: 'Within 2 weeks', description: 'Planning ahead' },
  { id: 'medium', name: 'Within 1 week', description: 'Soon as possible' },
  { id: 'high', name: 'Within 3 days', description: 'Urgent repair needed' },
  { id: 'emergency', name: 'Today/Tomorrow', description: 'Emergency situation' },
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    address: '',
    city: '',
    zipCode: '',
    urgency: '',
    budgetMin: '',
    budgetMax: '',
    preferredDate: '',
    preferredTime: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Pre-fill form from URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const updates: any = {};
    
    if (urlParams.get('service')) updates.serviceType = urlParams.get('service');
    if (urlParams.get('zip')) updates.zipCode = urlParams.get('zip');
    if (urlParams.get('email')) updates.email = urlParams.get('email');
    if (urlParams.get('phone')) updates.phone = urlParams.get('phone');
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Your booking request has been submitted! We\'ll match you with qualified contractors within 24 hours.');
        
        // Reset form
        setFormData({
          serviceType: '',
          description: '',
          address: '',
          city: '',
          zipCode: '',
          urgency: '',
          budgetMin: '',
          budgetMax: '',
          preferredDate: '',
          preferredTime: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        });
        setStep(1);
      } else {
        alert('Sorry, there was an error submitting your request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Sorry, there was an error submitting your request. Please try again.');
    }
  };

  const canProceedToStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 2:
        return formData.serviceType && formData.description;
      case 3:
        return formData.address && formData.city && formData.zipCode;
      case 4:
        return formData.urgency && formData.budgetMin;
      case 5:
        return formData.firstName && formData.email && formData.phone;
      default:
        return true;
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

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-600">
              Step {step} of 5: {
                step === 1 ? 'Service Type' :
                step === 2 ? 'Project Details' :
                step === 3 ? 'Location' :
                step === 4 ? 'Timeline & Budget' :
                'Contact Information'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Service Type */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What service do you need?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleInputChange('serviceType', service.id)}
                    className={`p-6 rounded-lg border-2 text-left transition-all ${
                      formData.serviceType === service.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <service.icon className={`w-8 h-8 mb-3 ${
                      formData.serviceType === service.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Describe your project</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="Please describe what you need done, any specific requirements, and current issues..."
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> The more details you provide, the better we can match you with the right contractor. 
                    Include things like room size, materials preferences, timeline, and any specific challenges.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Where is the work needed?</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="Tampa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="33101"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Timeline & Budget */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline & Budget</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How urgent is this project? *
                  </label>
                  <div className="space-y-2">
                    {urgencyLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => handleInputChange('urgency', level.id)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          formData.urgency === level.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">{level.name}</h3>
                            <p className="text-sm text-gray-600">{level.description}</p>
                          </div>
                          {level.id === 'emergency' && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              +$50 rush fee
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What's your budget range? *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        placeholder="Min budget"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        placeholder="Max budget"
                        min="0"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    This helps us match you with contractors in your price range
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Contact Information */}
          {step === 5 && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
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
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• We'll review your request within 2 hours</li>
                    <li>• You'll receive 2-3 contractor matches via email</li>
                    <li>• Each contractor will contact you directly to discuss your project</li>
                    <li>• Choose the best fit and schedule your service</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg flex items-center ${
                step === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedToStep(step + 1)}
                className={`px-6 py-3 rounded-lg flex items-center ${
                  canProceedToStep(step + 1)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceedToStep(5)}
                className={`px-8 py-3 rounded-lg flex items-center ${
                  canProceedToStep(5)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Request
                <CheckCircle className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}