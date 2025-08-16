"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, User, LogIn } from 'lucide-react';
import ThreeHero from './ThreeHero';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthenticatedThreeHeroProps {
  fallbackContent?: React.ReactNode;
}

export default function AuthenticatedThreeHero({ fallbackContent }: AuthenticatedThreeHeroProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-quantum" />
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
      >
        <div className="max-w-2xl mx-auto text-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-8 glass-card rounded-full flex items-center justify-center"
          >
            <Lock className="w-16 h-16 text-blue-300" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Premium 3D Workspace
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-white/80 mb-8 leading-relaxed"
          >
            Access our advanced 3D professional environment with interactive project visualization, 
            real-time collaboration tools, and enterprise-grade security features.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-quantum flex items-center justify-center"
              onClick={() => window.location.href = '/auth/signin'}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Access
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              onClick={() => window.location.href = '/auth/signup'}
            >
              <User className="w-5 h-5 mr-2" />
              Create Account
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex items-center justify-center space-x-6 text-white/60"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Secure Access</span>
            </div>
          </motion.div>
          
          {fallbackContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-16"
            >
              {fallbackContent}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // User is authenticated - show the 3D environment
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative"
    >
      {/* Welcome message for authenticated users */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-50 glass-card px-6 py-3 rounded-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">Welcome back!</div>
            <div className="text-white/70 text-sm">{user.email}</div>
          </div>
        </div>
      </motion.div>
      
      {/* 3D Environment */}
      <ThreeHero />
    </motion.div>
  );
}