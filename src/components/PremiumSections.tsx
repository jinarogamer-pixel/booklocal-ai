"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  Users,
  TrendingUp,
  Award,
  Quote,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Testimonials Section
export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CEO, TechFlow Solutions",
      company: "Fortune 500 Technology Company",
      content: "BookLocal transformed how we manage our global professional services. The AI matching is incredibly accurate, and we've seen a 300% improvement in project completion rates.",
      rating: 5,
      avatar: "SC",
      metrics: "300% improvement",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      name: "Marcus Rodriguez",
      role: "Operations Director",
      company: "Global Manufacturing Corp",
      content: "The enterprise security features give us complete confidence. Multi-factor authentication and real-time monitoring ensure our sensitive projects remain protected.",
      rating: 5,
      avatar: "MR",
      metrics: "100% secure",
      gradient: "from-purple-500 to-cyan-500"
    },
    {
      name: "Dr. Emily Watson",
      role: "Research Director",
      company: "Innovation Labs International",
      content: "Finding specialized professionals used to take weeks. With BookLocal's AI-powered matching, we connect with the right experts in minutes. It's revolutionary.",
      rating: 5,
      avatar: "EW",
      metrics: "Minutes vs weeks",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      name: "James Thompson",
      role: "Project Manager",
      company: "Enterprise Solutions Inc",
      content: "The 3D workspace visualization helps our team collaborate like never before. Complex projects become intuitive and manageable. Absolutely game-changing.",
      rating: 5,
      avatar: "JT",
      metrics: "Game-changing",
      gradient: "from-green-500 to-blue-500"
    },
    {
      name: "Lisa Park",
      role: "VP of Operations",
      company: "Global Consulting Group",
      content: "BookLocal's platform scales with our needs perfectly. From small tasks to enterprise-wide implementations, the quality remains consistently exceptional.",
      rating: 5,
      avatar: "LP",
      metrics: "Scales perfectly",
      gradient: "from-pink-500 to-purple-500"
    },
    {
      name: "David Kumar",
      role: "CTO",
      company: "Digital Innovation Hub",
      content: "The real-time analytics and reporting give us insights we never had before. We can optimize our professional services strategy with data-driven decisions.",
      rating: 5,
      avatar: "DK",
      metrics: "Data-driven",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-3 glass-card px-8 py-4 rounded-full mb-8"
          >
            <Quote className="w-6 h-6 text-blue-300" />
            <span className="text-white font-semibold text-lg">Trusted by Industry Leaders</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              What Our Clients Say
            </span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Join thousands of professionals and enterprises who trust BookLocal 
            to deliver exceptional results every time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-3xl magnetic-hover group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-lg`}>
                  {testimonial.avatar}
                </div>
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <blockquote className="text-white/90 text-lg leading-relaxed mb-6">
                "{testimonial.content}"
              </blockquote>
              
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-blue-300 text-sm">{testimonial.role}</div>
                    <div className="text-white/60 text-xs">{testimonial.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-sm">{testimonial.metrics}</div>
                    <div className="text-white/60 text-xs">Impact</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
export const PricingSection = () => {
  const plans = [
    {
      name: "Professional",
      price: "49",
      period: "month",
      description: "Perfect for individual professionals and small teams",
      features: [
        "Up to 10 projects per month",
        "Basic AI matching",
        "Standard support",
        "Mobile app access",
        "Basic analytics",
        "Email notifications"
      ],
      cta: "Start Free Trial",
      popular: false,
      gradient: "from-blue-500 to-purple-500"
    },
    {
      name: "Enterprise",
      price: "199",
      period: "month",
      description: "Advanced features for growing businesses",
      features: [
        "Unlimited projects",
        "Advanced AI matching",
        "3D workspace access",
        "Priority support",
        "Advanced analytics",
        "Team collaboration tools",
        "Custom integrations",
        "Dedicated account manager"
      ],
      cta: "Start Enterprise Trial",
      popular: true,
      gradient: "from-purple-500 to-cyan-500"
    },
    {
      name: "Fortune 500",
      price: "Custom",
      period: "enterprise",
      description: "White-glove service for large enterprises",
      features: [
        "Everything in Enterprise",
        "Custom AI training",
        "Multi-factor authentication",
        "Advanced security monitoring",
        "24/7 dedicated support",
        "Custom compliance features",
        "On-premise deployment",
        "Executive reporting"
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-cyan-500 to-blue-500"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-3 glass-card px-8 py-4 rounded-full mb-8"
          >
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-white font-semibold text-lg">Choose Your Plan</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Enterprise Pricing
            </span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Flexible plans designed to scale with your business needs. 
            All plans include our core AI matching technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`relative glass-card rounded-3xl p-8 magnetic-hover ${
                plan.popular ? 'ring-2 ring-purple-400 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-2 rounded-full text-white font-bold text-sm flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </motion.div>
              )}
              
              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center`}>
                  {plan.name === 'Professional' && <Users className="w-10 h-10 text-white" />}
                  {plan.name === 'Enterprise' && <Zap className="w-10 h-10 text-white" />}
                  {plan.name === 'Fortune 500' && <Crown className="w-10 h-10 text-white" />}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/70 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <div className="text-4xl font-black text-white">Custom</div>
                  ) : (
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-black text-white">${plan.price}</span>
                      <span className="text-white/60 ml-2">/{plan.period}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li
                    key={featureIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * featureIndex }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  plan.popular 
                    ? 'btn-quantum' 
                    : 'glass-card hover:bg-white/20 text-white'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        {/* Enterprise Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-12 rounded-3xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Shield className="w-8 h-8 text-green-400" />
              <Award className="w-8 h-8 text-yellow-400" />
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">
              Need a Custom Solution?
            </h3>
            
            <p className="text-xl text-white/80 mb-8">
              Our enterprise team can create a tailored solution for your specific needs, 
              including custom integrations, compliance requirements, and dedicated support.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-quantum text-xl px-12 py-4"
            >
              Schedule Enterprise Consultation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};