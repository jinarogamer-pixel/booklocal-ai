"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  MapPin, 
  Phone, 
  ArrowRight,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

// Simple, fast-loading hero section
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Find Trusted Home Service Professionals in
              <span className="text-blue-600"> Florida</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Licensed, insured, and verified contractors for all your home improvement needs. 
              Get instant quotes and book with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold transition-colors">
                Browse Contractors
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Quote Request</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What service do you need?
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3">
                    <option>Select a service...</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>HVAC</option>
                    <option>Handyman</option>
                    <option>Painting</option>
                    <option>Flooring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your ZIP Code
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g., 33101"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Get Matched with Contractors
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Trust indicators
function TrustSection() {
  const stats = [
    { icon: Users, value: "10,000+", label: "Happy Customers" },
    { icon: Award, value: "500+", label: "Verified Contractors" },
    { icon: Star, value: "4.8/5", label: "Average Rating" },
    { icon: TrendingUp, value: "98%", label: "Completion Rate" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Florida Homeowners
          </h2>
          <p className="text-lg text-gray-600">
            Our platform connects you with the best local contractors
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it works
function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Request Service",
      description: "Tell us what you need and where you're located",
      icon: MapPin
    },
    {
      step: "2", 
      title: "Get Matched",
      description: "We connect you with verified local contractors",
      icon: Users
    },
    {
      step: "3",
      title: "Book & Pay Safely",
      description: "Choose your contractor and pay securely through our platform",
      icon: Shield
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How BookLocal Works
          </h2>
          <p className="text-lg text-gray-600">
            Get your project done in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.step}
              </div>
              <step.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Services section
function ServicesSection() {
  const services = [
    { name: "Plumbing", description: "Repairs, installations, emergencies" },
    { name: "Electrical", description: "Wiring, outlets, lighting, panels" },
    { name: "HVAC", description: "AC repair, heating, installation" },
    { name: "Handyman", description: "General repairs and maintenance" },
    { name: "Painting", description: "Interior and exterior painting" },
    { name: "Flooring", description: "Installation, repair, refinishing" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Services
          </h2>
          <p className="text-lg text-gray-600">
            Find qualified contractors for any home improvement project
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">
                Find {service.name} Contractors →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Safety guarantees
function SafetySection() {
  const guarantees = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "All contractors are verified, licensed, and carry insurance"
    },
    {
      icon: CheckCircle,
      title: "Background Checked",
      description: "Every contractor passes comprehensive background screening"
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "We monitor work quality and customer satisfaction"
    },
    {
      icon: Clock,
      title: "On-Time Service",
      description: "Reliable contractors who respect your time"
    }
  ];

  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Safety is Our Priority
          </h2>
          <p className="text-lg text-blue-100">
            Every contractor on our platform meets strict safety and quality standards
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center text-white"
            >
              <guarantee.icon className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{guarantee.title}</h3>
              <p className="text-blue-100">{guarantee.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA section
function CTASection() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Get Your Project Started?
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Join thousands of satisfied customers who trust BookLocal for their home improvement needs
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
            Get Free Quote Today
          </button>
          <button className="border border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
            <Phone className="w-5 h-5 mr-2" />
            Call (855) BOOKLOCAL
          </button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Simple navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">BookLocal</div>
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900">Services</a>
              <a href="#contractors" className="text-gray-600 hover:text-gray-900">Find Contractors</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page sections */}
      <HeroSection />
      <TrustSection />
      <HowItWorksSection />
      <ServicesSection />
      <SafetySection />
      <CTASection />

      {/* Simple footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">BookLocal</div>
              <p className="text-gray-400">
                Connecting Florida homeowners with trusted, verified contractors.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Plumbing</li>
                <li>Electrical</li>
                <li>HVAC</li>
                <li>Handyman</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="text-gray-400">
                <p>(855) BOOKLOCAL</p>
                <p>support@booklocal.com</p>
                <p>Florida, USA</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BookLocal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
