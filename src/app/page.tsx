"use client";

import React, { useState } from 'react';
import { 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  Phone, 
  ArrowRight,
  Users,
  MapPin
} from 'lucide-react';

// Ultra-lean hero section for validation
function HeroSection() {
  const [formData, setFormData] = useState({
    serviceType: '',
    zipCode: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to real lead capture system
    console.log('Lead captured:', formData);
    alert('Thanks! We\'ll contact you within 24 hours with contractor matches.');
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Value Proposition */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Find Licensed Contractors in Florida
              <span className="text-blue-600"> Fast & Safe</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get matched with verified, insured contractors for your home project. 
              No guesswork, no surprises - just quality work at fair prices.
            </p>
            
            {/* Trust indicators */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Licensed & Insured</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Background Checked</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Customer Rated</span>
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>500+ contractors verified</strong> • <strong>10,000+ jobs completed</strong>
              </p>
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <span className="ml-3 text-sm text-gray-600">Join thousands of satisfied customers</span>
              </div>
            </div>
          </div>

          {/* Right: Lead Capture Form */}
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Free Quotes</h3>
            <p className="text-gray-600 mb-6">Tell us about your project and we'll match you with the best contractors</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What service do you need? *
                </label>
                <select 
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a service...</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="handyman">Handyman</option>
                  <option value="painting">Painting</option>
                  <option value="flooring">Flooring</option>
                  <option value="roofing">Roofing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your ZIP Code *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 33101"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                Get Matched with Contractors
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <p className="text-xs text-gray-500 text-center">
                100% Free • No Obligation • Response in 24 Hours
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple how it works
function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Tell Us Your Needs",
      description: "Describe your project and location"
    },
    {
      step: "2", 
      title: "Get Matched",
      description: "We connect you with verified contractors"
    },
    {
      step: "3",
      title: "Choose & Book",
      description: "Compare quotes and hire the best fit"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Get your project done in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Service areas (Florida focus)
function ServiceAreasSection() {
  const cities = [
    "Tampa", "Orlando", "Miami", "Jacksonville", 
    "Fort Lauderdale", "St. Petersburg", "Hialeah", "Tallahassee"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Serving Florida Cities
          </h2>
          <p className="text-lg text-gray-600">
            Find qualified contractors in your area
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map((city, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-blue-50 transition-colors">
              <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{city}</div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't see your city? <a href="#contact" className="text-blue-600 hover:text-blue-700 font-semibold">Contact us</a> - we're expanding fast!
          </p>
        </div>
      </div>
    </section>
  );
}

// Contractor CTA section
function ContractorCTASection() {
  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Are You a Licensed Contractor?
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Join our network and get matched with customers who need your services
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Join as Contractor
          </button>
          <button className="border border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
            <Phone className="w-5 h-5 mr-2" />
            Call (855) BOOKLOCAL
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LeanMVPPage() {
  return (
    <div className="min-h-screen">
      {/* Simple navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">BookLocal</div>
            <div className="hidden md:flex space-x-6">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#contractors" className="text-gray-600 hover:text-gray-900">For Contractors</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Page sections */}
      <HeroSection />
      <HowItWorksSection />
      <ServiceAreasSection />
      <ContractorCTASection />

      {/* Simple footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-xl font-bold text-blue-400 mb-4">BookLocal</div>
              <p className="text-gray-400 text-sm">
                Connecting Florida homeowners with trusted, verified contractors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="text-gray-400 text-sm">
                <p>(855) BOOKLOCAL</p>
                <p>hello@booklocal.com</p>
                <p>Florida, USA</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="text-gray-400 text-sm space-y-1">
                <div><a href="/privacy" className="hover:text-white">Privacy Policy</a></div>
                <div><a href="/terms" className="hover:text-white">Terms of Service</a></div>
                <div><a href="/contractor-terms" className="hover:text-white">Contractor Terms</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 BookLocal, Inc. All rights reserved. Licensed marketplace facilitator.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
