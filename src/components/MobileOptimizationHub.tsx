"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone,
  Tablet,
  Monitor,
  Accessibility,
  Wifi,
  WifiOff,
  Download,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Headphones,
  Zap,
  Battery,
  Signal,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Star,
  Users,
  Globe,
  Shield,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize,
  Plus,
  Minus,
  Search,
  Filter,
  Menu,
  X,
  Home,
  User,
  Briefcase,
  MessageCircle,
  Calendar,
  Camera,
  Map,
  Heart,
  Share2,
  Bookmark,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DevicePreview {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  icon: React.ElementType;
  orientation: 'portrait' | 'landscape';
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
  category: 'visual' | 'audio' | 'motor' | 'cognitive';
  impact: 'high' | 'medium' | 'low';
}

interface PWAFeature {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'pending';
  icon: React.ElementType;
  benefits: string[];
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  status: 'good' | 'needs_improvement' | 'poor';
  description: string;
}

const mockDevices: DevicePreview[] = [
  { id: '1', name: 'iPhone 14 Pro', type: 'mobile', width: 393, height: 852, icon: Smartphone, orientation: 'portrait' },
  { id: '2', name: 'Samsung Galaxy S23', type: 'mobile', width: 360, height: 800, icon: Smartphone, orientation: 'portrait' },
  { id: '3', name: 'iPad Pro', type: 'tablet', width: 1024, height: 1366, icon: Tablet, orientation: 'portrait' },
  { id: '4', name: 'MacBook Pro', type: 'desktop', width: 1440, height: 900, icon: Monitor, orientation: 'landscape' }
];

const mockAccessibilityFeatures: AccessibilityFeature[] = [
  {
    id: '1',
    name: 'High Contrast Mode',
    description: 'Increases contrast for better visibility',
    enabled: true,
    icon: Contrast,
    category: 'visual',
    impact: 'high'
  },
  {
    id: '2',
    name: 'Large Text Support',
    description: 'Scalable text up to 200% without loss of functionality',
    enabled: true,
    icon: Type,
    category: 'visual',
    impact: 'high'
  },
  {
    id: '3',
    name: 'Screen Reader Compatible',
    description: 'Full compatibility with NVDA, JAWS, and VoiceOver',
    enabled: true,
    icon: Volume2,
    category: 'audio',
    impact: 'high'
  },
  {
    id: '4',
    name: 'Keyboard Navigation',
    description: 'Complete keyboard accessibility with focus indicators',
    enabled: true,
    icon: Keyboard,
    category: 'motor',
    impact: 'high'
  },
  {
    id: '5',
    name: 'Voice Commands',
    description: 'Voice-controlled navigation and actions',
    enabled: false,
    icon: Headphones,
    category: 'motor',
    impact: 'medium'
  },
  {
    id: '6',
    name: 'Reduced Motion',
    description: 'Respects prefers-reduced-motion settings',
    enabled: true,
    icon: RotateCcw,
    category: 'cognitive',
    impact: 'medium'
  }
];

const mockPWAFeatures: PWAFeature[] = [
  {
    id: '1',
    name: 'Offline Functionality',
    description: 'Core features work without internet connection',
    status: 'enabled',
    icon: WifiOff,
    benefits: ['Browse cached content', 'Submit forms when online', 'View project history']
  },
  {
    id: '2',
    name: 'Push Notifications',
    description: 'Real-time updates and reminders',
    status: 'enabled',
    icon: Bell,
    benefits: ['Project updates', 'New messages', 'Booking confirmations']
  },
  {
    id: '3',
    name: 'App-like Experience',
    description: 'Install as native app on any device',
    status: 'enabled',
    icon: Download,
    benefits: ['Home screen icon', 'Full-screen mode', 'Native feel']
  },
  {
    id: '4',
    name: 'Background Sync',
    description: 'Sync data when connection is restored',
    status: 'enabled',
    icon: RotateCcw,
    benefits: ['Auto-sync messages', 'Update project status', 'Cache new content']
  }
];

const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    id: '1',
    name: 'First Contentful Paint',
    value: 1.2,
    unit: 's',
    target: 1.8,
    status: 'good',
    description: 'Time until first content appears'
  },
  {
    id: '2',
    name: 'Largest Contentful Paint',
    value: 2.1,
    unit: 's',
    target: 2.5,
    status: 'good',
    description: 'Time until main content loads'
  },
  {
    id: '3',
    name: 'Cumulative Layout Shift',
    value: 0.08,
    unit: '',
    target: 0.1,
    status: 'good',
    description: 'Visual stability during loading'
  },
  {
    id: '4',
    name: 'Time to Interactive',
    value: 3.2,
    unit: 's',
    target: 3.8,
    status: 'good',
    description: 'Time until page is fully interactive'
  }
];

export default function MobileOptimizationHub() {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreview>(mockDevices[0]);
  const [activeTab, setActiveTab] = useState<'preview' | 'accessibility' | 'pwa' | 'performance'>('preview');
  const [isInstallable, setIsInstallable] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'enabled': return 'text-green-400 bg-green-500/20';
      case 'needs_improvement':
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'poor':
      case 'disabled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const calculateAccessibilityScore = () => {
    const enabledFeatures = mockAccessibilityFeatures.filter(f => f.enabled);
    const totalWeight = mockAccessibilityFeatures.reduce((sum, f) => 
      sum + (f.impact === 'high' ? 3 : f.impact === 'medium' ? 2 : 1), 0
    );
    const enabledWeight = enabledFeatures.reduce((sum, f) => 
      sum + (f.impact === 'high' ? 3 : f.impact === 'medium' ? 2 : 1), 0
    );
    return Math.round((enabledWeight / totalWeight) * 100);
  };

  const calculatePerformanceScore = () => {
    const goodMetrics = mockPerformanceMetrics.filter(m => m.status === 'good').length;
    return Math.round((goodMetrics / mockPerformanceMetrics.length) * 100);
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
              Mobile & Accessibility
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Progressive Web App capabilities, comprehensive accessibility features, 
            and mobile-first design optimization for exceptional user experience across all devices.
          </p>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Mobile Users', 
              value: '78%', 
              icon: Smartphone, 
              color: 'text-blue-400',
              change: '+12% this year'
            },
            { 
              label: 'Accessibility Score', 
              value: `${calculateAccessibilityScore()}%`, 
              icon: Accessibility, 
              color: 'text-green-400',
              change: 'WCAG 2.1 AA compliant'
            },
            { 
              label: 'Performance Score', 
              value: `${calculatePerformanceScore()}%`, 
              icon: Zap, 
              color: 'text-yellow-400',
              change: 'Core Web Vitals'
            },
            { 
              label: 'PWA Features', 
              value: `${mockPWAFeatures.filter(f => f.status === 'enabled').length}/${mockPWAFeatures.length}`, 
              icon: Download, 
              color: 'text-purple-400',
              change: 'Fully installable'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-card p-6 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
              </div>
              <div className="text-white/80 font-semibold mb-1">{stat.label}</div>
              <div className="text-white/60 text-sm">{stat.change}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-3xl p-2 flex space-x-2">
            {[
              { id: 'preview', label: 'Device Preview', icon: Smartphone },
              { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
              { id: 'pwa', label: 'PWA Features', icon: Download },
              { id: 'performance', label: 'Performance', icon: Gauge }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Device Selector */}
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Device Preview
                </h3>

                <div className="space-y-3">
                  {mockDevices.map((device, index) => (
                    <motion.button
                      key={device.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedDevice(device)}
                      className={`w-full p-4 rounded-2xl border transition-all duration-300 text-left ${
                        selectedDevice.id === device.id
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <device.icon className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="text-white font-semibold">{device.name}</div>
                          <div className="text-white/60 text-sm">
                            {device.width} × {device.height}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5" />
                    <span>Rotate Device</span>
                  </button>
                  
                  <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                    <Camera className="w-5 h-5" />
                    <span>Take Screenshot</span>
                  </button>
                  
                  <button 
                    onClick={() => setAccessibilityEnabled(!accessibilityEnabled)}
                    className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3"
                  >
                    <Accessibility className="w-5 h-5" />
                    <span>{accessibilityEnabled ? 'Disable' : 'Enable'} A11y Mode</span>
                  </button>
                </div>
              </div>

              {/* Device Frame */}
              <div className="lg:col-span-3 glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <selectedDevice.icon className="w-5 h-5 mr-2" />
                    {selectedDevice.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-white/60">
                      <Signal className="w-4 h-4" />
                      <Battery className="w-4 h-4" />
                      <Wifi className="w-4 h-4" />
                    </div>
                    <span className="text-white/60 text-sm">
                      {selectedDevice.width} × {selectedDevice.height}
                    </span>
                  </div>
                </div>

                {/* Mobile App Preview */}
                <div 
                  className="mx-auto bg-black rounded-3xl p-4 shadow-2xl"
                  style={{ 
                    width: Math.min(selectedDevice.width * 0.8, 400),
                    height: Math.min(selectedDevice.height * 0.8, 600)
                  }}
                >
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-white text-xs mb-4 px-2">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <Signal className="w-3 h-3" />
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3 h-3" />
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl h-full overflow-hidden">
                    {/* App Header */}
                    <div className="bg-white/10 backdrop-blur-sm p-4 flex items-center justify-between">
                      <h4 className="text-white font-bold">BookLocal</h4>
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-white" />
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          { icon: Search, label: 'Find Contractors', color: 'from-blue-500 to-blue-600' },
                          { icon: Calendar, label: 'My Bookings', color: 'from-green-500 to-green-600' },
                          { icon: MessageCircle, label: 'Messages', color: 'from-purple-500 to-purple-600' },
                          { icon: Star, label: 'Favorites', color: 'from-yellow-500 to-yellow-600' }
                        ].map((action, idx) => (
                          <div key={idx} className={`bg-gradient-to-br ${action.color} rounded-2xl p-3 text-center`}>
                            <action.icon className="w-6 h-6 text-white mx-auto mb-1" />
                            <div className="text-white text-xs font-semibold">{action.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent Activity */}
                      <div className="space-y-3">
                        <h5 className="text-white font-semibold text-sm">Recent Activity</h5>
                        {[
                          { title: 'Kitchen Renovation', status: 'In Progress', time: '2h ago' },
                          { title: 'Plumbing Repair', status: 'Completed', time: '1d ago' },
                          { title: 'Electrical Work', status: 'Scheduled', time: '3d ago' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-white/10 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white text-sm font-semibold">{item.title}</div>
                                <div className="text-white/70 text-xs">{item.status}</div>
                              </div>
                              <div className="text-white/60 text-xs">{item.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm p-4">
                      <div className="flex items-center justify-around">
                        {[Home, Search, Calendar, MessageCircle, User].map((Icon, idx) => (
                          <Icon key={idx} className="w-6 h-6 text-white/70" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'accessibility' && (
            <motion.div
              key="accessibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Accessibility Features */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Accessibility className="w-6 h-6 mr-3" />
                    Accessibility Features
                  </h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{calculateAccessibilityScore()}%</div>
                    <div className="text-white/60 text-sm">WCAG 2.1 AA</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockAccessibilityFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{feature.name}</h3>
                            <p className="text-white/70 text-sm">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(feature.impact)}`}>
                            {feature.impact.toUpperCase()}
                          </div>
                          <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                            feature.enabled ? 'bg-green-500' : 'bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 mt-0.5 ${
                              feature.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </div>
                        </div>
                      </div>

                      <div className="text-white/60 text-sm">
                        Category: {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Accessibility Testing */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Compliance Testing
                </h2>

                <div className="space-y-6">
                  {/* WCAG Compliance */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">WCAG 2.1 Compliance</h4>
                    <div className="space-y-3">
                      {[
                        { level: 'A', status: 'passed', tests: 25, color: 'text-green-400' },
                        { level: 'AA', status: 'passed', tests: 13, color: 'text-green-400' },
                        { level: 'AAA', status: 'partial', tests: 8, color: 'text-yellow-400' }
                      ].map((compliance, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className={`w-5 h-5 ${compliance.color}`} />
                            <span className="text-white">Level {compliance.level}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${compliance.color}`}>
                              {compliance.status.toUpperCase()}
                            </div>
                            <div className="text-white/60 text-sm">{compliance.tests} tests</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screen Reader Test */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Screen Reader Testing</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'NVDA', status: 'Compatible', version: '2023.1' },
                        { name: 'JAWS', status: 'Compatible', version: '2023' },
                        { name: 'VoiceOver', status: 'Compatible', version: 'macOS 13' },
                        { name: 'TalkBack', status: 'Compatible', version: 'Android 13' }
                      ].map((reader, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Volume2 className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{reader.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-semibold">{reader.status}</div>
                            <div className="text-white/60 text-xs">{reader.version}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Contrast */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Color Contrast</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Normal Text</span>
                        <span className="text-green-400 font-semibold">4.8:1 ✓</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Large Text</span>
                        <span className="text-green-400 font-semibold">3.2:1 ✓</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Interactive Elements</span>
                        <span className="text-green-400 font-semibold">5.1:1 ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Actions */}
                  <div className="space-y-3">
                    <button className="w-full btn-quantum">
                      Run Full Accessibility Audit
                    </button>
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                      Generate Compliance Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pwa' && (
            <motion.div
              key="pwa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* PWA Features */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Download className="w-6 h-6 mr-3" />
                    PWA Features
                  </h2>
                  {isInstallable && (
                    <button className="btn-quantum flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Install App</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {mockPWAFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{feature.name}</h3>
                            <p className="text-white/70 text-sm">{feature.description}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(feature.status)}`}>
                          {feature.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-white/70 text-sm font-semibold">Benefits:</div>
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-white/80 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* PWA Capabilities */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Zap className="w-6 h-6 mr-3" />
                  App Capabilities
                </h2>

                <div className="space-y-6">
                  {/* Installation Stats */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Installation Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">12.4K</div>
                        <div className="text-white/60 text-sm">Total Installs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">68%</div>
                        <div className="text-white/60 text-sm">Install Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">4.2</div>
                        <div className="text-white/60 text-sm">Avg Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">85%</div>
                        <div className="text-white/60 text-sm">Retention</div>
                      </div>
                    </div>
                  </div>

                  {/* Offline Status */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Offline Status</h4>
                      <button
                        onClick={() => setIsOffline(!isOffline)}
                        className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                          isOffline ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 mt-0.5 ${
                          isOffline ? 'translate-x-0.5' : 'translate-x-6'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isOffline ? (
                        <>
                          <WifiOff className="w-5 h-5 text-red-400" />
                          <span className="text-red-400">Offline Mode Active</span>
                        </>
                      ) : (
                        <>
                          <Wifi className="w-5 h-5 text-green-400" />
                          <span className="text-green-400">Online - All Features Available</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Platform Support */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Platform Support</h4>
                    <div className="space-y-3">
                      {[
                        { platform: 'iOS Safari', support: 'Full', color: 'text-green-400' },
                        { platform: 'Android Chrome', support: 'Full', color: 'text-green-400' },
                        { platform: 'Desktop Chrome', support: 'Full', color: 'text-green-400' },
                        { platform: 'Desktop Safari', support: 'Partial', color: 'text-yellow-400' },
                        { platform: 'Firefox', support: 'Full', color: 'text-green-400' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-white">{item.platform}</span>
                          <span className={`font-semibold ${item.color}`}>{item.support}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                      <Bell className="w-5 h-5" />
                      <span>Test Push Notifications</span>
                    </button>
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                      <RotateCcw className="w-5 h-5" />
                      <span>Force Background Sync</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Performance Metrics */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Gauge className="w-6 h-6 mr-3" />
                    Core Web Vitals
                  </h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{calculatePerformanceScore()}%</div>
                    <div className="text-white/60 text-sm">Performance Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockPerformanceMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">{metric.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(metric.status)}`}>
                          {metric.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>

                      <p className="text-white/70 text-sm mb-4">{metric.description}</p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80">Current</span>
                        <span className="text-white font-semibold">
                          {metric.value}{metric.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/80">Target</span>
                        <span className="text-white/60">
                          {metric.target}{metric.unit}
                        </span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'needs_improvement' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Performance Optimization */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  Optimization Insights
                </h2>

                <div className="space-y-6">
                  {/* Mobile Performance */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Mobile Performance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Lighthouse Score</span>
                        <span className="text-green-400 font-semibold">94/100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Bundle Size</span>
                        <span className="text-blue-400 font-semibold">245 KB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Load Time (3G)</span>
                        <span className="text-yellow-400 font-semibold">2.8s</span>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Suggestions */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Optimization Opportunities</h4>
                    <div className="space-y-3">
                      {[
                        { 
                          suggestion: 'Enable image lazy loading', 
                          impact: 'High', 
                          savings: '0.8s',
                          status: 'implemented'
                        },
                        { 
                          suggestion: 'Implement code splitting', 
                          impact: 'Medium', 
                          savings: '0.3s',
                          status: 'implemented'
                        },
                        { 
                          suggestion: 'Optimize font loading', 
                          impact: 'Low', 
                          savings: '0.1s',
                          status: 'pending'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm">{item.suggestion}</div>
                            <div className="text-white/60 text-xs">
                              {item.impact} impact • {item.savings} savings
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'implemented' ? 'text-green-400 bg-green-500/20' : 'text-yellow-400 bg-yellow-500/20'
                          }`}>
                            {item.status.toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resource Usage */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Resource Usage</h4>
                    <div className="space-y-4">
                      {[
                        { name: 'JavaScript', size: '145 KB', percentage: 59 },
                        { name: 'CSS', size: '32 KB', percentage: 13 },
                        { name: 'Images', size: '68 KB', percentage: 28 }
                      ].map((resource, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">{resource.name}</span>
                            <span className="text-white/60 text-sm">{resource.size}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${resource.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button className="w-full btn-quantum">
                      Run Performance Audit
                    </button>
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                      Generate Optimization Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}