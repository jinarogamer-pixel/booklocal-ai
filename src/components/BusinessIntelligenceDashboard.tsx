"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Calendar,
  Target,
  Activity,
  Clock,
  Star,
  MapPin,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Filter,
  Settings,
  RefreshCw,
  PieChart,
  LineChart,
  BarChart,
  Globe,
  Briefcase,
  Building,
  Phone,
  Mail,
  Share2,
  FileText,
  Search,
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Minus,
  Brain,
  Lightbulb,
  Gauge,
  Shield,
  CreditCard,
  UserCheck,
  Layers,
  Database,
  Cpu,
  Wifi
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  format: 'number' | 'currency' | 'percentage' | 'duration';
  trend: 'up' | 'down' | 'stable';
  category: 'revenue' | 'operations' | 'quality' | 'growth';
}

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

interface PredictiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: string[];
  estimatedValue?: number;
}

interface PerformanceData {
  contractors: {
    total: number;
    active: number;
    topRated: number;
    averageRating: number;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    avgProjectValue: number;
  };
  quality: {
    overallScore: number;
    clientSatisfaction: number;
    onTimeRate: number;
    disputeRate: number;
  };
}

const mockMetrics: AnalyticsMetric[] = [
  {
    id: '1',
    name: 'Total Revenue',
    value: 2847500,
    previousValue: 2456000,
    unit: '$',
    format: 'currency',
    trend: 'up',
    category: 'revenue'
  },
  {
    id: '2',
    name: 'Active Contractors',
    value: 12847,
    previousValue: 11203,
    unit: '',
    format: 'number',
    trend: 'up',
    category: 'operations'
  },
  {
    id: '3',
    name: 'Project Completion Rate',
    value: 94.7,
    previousValue: 92.1,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    category: 'quality'
  },
  {
    id: '4',
    name: 'Average Response Time',
    value: 12,
    previousValue: 18,
    unit: 'min',
    format: 'duration',
    trend: 'up',
    category: 'operations'
  },
  {
    id: '5',
    name: 'Client Retention Rate',
    value: 87.3,
    previousValue: 84.6,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    category: 'growth'
  },
  {
    id: '6',
    name: 'Platform Usage Growth',
    value: 23.4,
    previousValue: 18.7,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    category: 'growth'
  }
];

const mockRevenueData: ChartDataPoint[] = [
  { label: 'Jan', value: 180000, date: '2024-01' },
  { label: 'Feb', value: 220000, date: '2024-02' },
  { label: 'Mar', value: 195000, date: '2024-03' },
  { label: 'Apr', value: 280000, date: '2024-04' },
  { label: 'May', value: 340000, date: '2024-05' },
  { label: 'Jun', value: 420000, date: '2024-06' },
  { label: 'Jul', value: 380000, date: '2024-07' },
  { label: 'Aug', value: 450000, date: '2024-08' },
  { label: 'Sep', value: 520000, date: '2024-09' },
  { label: 'Oct', value: 480000, date: '2024-10' },
  { label: 'Nov', value: 580000, date: '2024-11' },
  { label: 'Dec', value: 650000, date: '2024-12' }
];

const mockCategoryData: ChartDataPoint[] = [
  { label: 'Home Renovation', value: 35, category: 'construction' },
  { label: 'Plumbing', value: 22, category: 'maintenance' },
  { label: 'Electrical', value: 18, category: 'maintenance' },
  { label: 'Landscaping', value: 12, category: 'outdoor' },
  { label: 'Cleaning', value: 8, category: 'maintenance' },
  { label: 'Other', value: 5, category: 'misc' }
];

const mockInsights: PredictiveInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'High-Value Project Surge Predicted',
    description: 'AI models predict a 40% increase in premium projects ($10K+) in Q2 based on seasonal trends and economic indicators.',
    impact: 'high',
    confidence: 87,
    actionItems: [
      'Recruit 15+ enterprise-level contractors',
      'Enhance premium project marketing',
      'Prepare capacity for luxury home market'
    ],
    estimatedValue: 850000
  },
  {
    id: '2',
    type: 'optimization',
    title: 'Response Time Optimization Opportunity',
    description: 'Reducing average response time from 12 to 8 minutes could increase booking conversion by 23%.',
    impact: 'medium',
    confidence: 92,
    actionItems: [
      'Implement AI-powered auto-responses',
      'Optimize contractor notification system',
      'Create response time incentives'
    ],
    estimatedValue: 340000
  },
  {
    id: '3',
    type: 'risk',
    title: 'Contractor Capacity Constraint',
    description: 'Current growth rate will exceed contractor capacity by 15% within 6 weeks without intervention.',
    impact: 'high',
    confidence: 78,
    actionItems: [
      'Accelerate contractor onboarding',
      'Implement dynamic pricing for peak demand',
      'Expand to adjacent markets'
    ]
  },
  {
    id: '4',
    type: 'trend',
    title: 'Smart Home Integration Demand Rising',
    description: 'Smart home project requests have increased 156% year-over-year, representing untapped revenue potential.',
    impact: 'medium',
    confidence: 85,
    actionItems: [
      'Partner with smart home technology companies',
      'Create specialized smart home contractor category',
      'Develop IoT installation certification program'
    ],
    estimatedValue: 420000
  }
];

const mockPerformanceData: PerformanceData = {
  contractors: {
    total: 12847,
    active: 8934,
    topRated: 2847,
    averageRating: 4.7
  },
  projects: {
    total: 45892,
    completed: 43459,
    inProgress: 2433,
    completionRate: 94.7
  },
  revenue: {
    total: 2847500,
    monthly: 580000,
    growth: 23.4,
    avgProjectValue: 2850
  },
  quality: {
    overallScore: 9.1,
    clientSatisfaction: 96.3,
    onTimeRate: 94.7,
    disputeRate: 1.2
  }
};

export default function BusinessIntelligenceDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'operations' | 'quality' | 'insights'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric | null>(null);
  const [isRealTime, setIsRealTime] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        // Simulate metric updates
        console.log('Real-time data update...');
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${value}${unit}`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'optimization': return <Zap className="w-5 h-5 text-blue-400" />;
      case 'trend': return <Brain className="w-5 h-5 text-purple-400" />;
      default: return <Lightbulb className="w-5 h-5 text-yellow-400" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Business Intelligence
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl">
              Advanced analytics, predictive insights, and real-time performance monitoring 
              to optimize your platform's growth and profitability.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Toggle */}
            <div className="flex items-center space-x-3 glass-card px-4 py-2 rounded-xl">
              <div className={`w-3 h-3 rounded-full ${isRealTime ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span className="text-white/80 text-sm">
                {isRealTime ? 'Live Data' : 'Static View'}
              </span>
              <button
                onClick={() => setIsRealTime(!isRealTime)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Wifi className="w-4 h-4" />
              </button>
            </div>

            {/* Export Button */}
            <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-3xl p-2 flex space-x-2">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' }
            ].map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id as any)}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 ${
                  selectedTimeframe === timeframe.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {mockMetrics.map((metric, index) => {
            const changePercent = ((metric.value - metric.previousValue) / metric.previousValue * 100);
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card p-6 rounded-3xl magnetic-hover cursor-pointer"
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/70 text-sm font-semibold">{metric.name}</div>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="text-3xl font-black text-white mb-2">
                  {formatValue(metric.value, metric.format, metric.unit)}
                </div>
                
                <div className={`flex items-center space-x-2 text-sm ${getTrendColor(metric.trend)}`}>
                  <span>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
                  <span className="text-white/60">vs last period</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-3xl p-2 flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'operations', label: 'Operations', icon: Activity },
              { id: 'quality', label: 'Quality', icon: Star },
              { id: 'insights', label: 'AI Insights', icon: Brain }
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
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Revenue Chart */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <LineChart className="w-6 h-6 mr-3" />
                  Revenue Trends
                </h2>
                
                <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Revenue Growth Chart</h3>
                    <p className="text-white/70 mb-4">Monthly revenue progression with trend analysis</p>
                    <div className="text-green-400 text-2xl font-bold">+23.4% Growth</div>
                  </div>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Gauge className="w-6 h-6 mr-3" />
                  Performance Overview
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Platform Health Score</span>
                      <span className="text-2xl font-bold text-green-400">9.2/10</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-[92%]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Operational Efficiency</span>
                      <span className="text-2xl font-bold text-blue-400">87%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[87%]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Growth Momentum</span>
                      <span className="text-2xl font-bold text-purple-400">94%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full w-[94%]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'revenue' && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Revenue Breakdown */}
              <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <DollarSign className="w-6 h-6 mr-3" />
                  Revenue Analytics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-6">
                    <div className="text-green-400 text-sm font-semibold mb-2">Total Revenue</div>
                    <div className="text-3xl font-bold text-white mb-1">$2.85M</div>
                    <div className="text-green-400 text-sm">+23.4% from last month</div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6">
                    <div className="text-blue-400 text-sm font-semibold mb-2">Monthly Recurring</div>
                    <div className="text-3xl font-bold text-white mb-1">$580K</div>
                    <div className="text-blue-400 text-sm">+18.7% growth rate</div>
                  </div>
                </div>

                <div className="aspect-video bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Revenue Breakdown Chart</h3>
                    <p className="text-white/70">Detailed revenue analysis by category and time period</p>
                  </div>
                </div>
              </div>

              {/* Revenue Insights */}
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Revenue Insights</h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-white font-semibold mb-2">Top Revenue Category</div>
                    <div className="text-green-400 text-lg">Home Renovation</div>
                    <div className="text-white/60 text-sm">35% of total revenue</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-white font-semibold mb-2">Average Project Value</div>
                    <div className="text-blue-400 text-lg">$2,850</div>
                    <div className="text-white/60 text-sm">+12% vs last quarter</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-white font-semibold mb-2">Revenue per Contractor</div>
                    <div className="text-purple-400 text-lg">$1,247</div>
                    <div className="text-white/60 text-sm">Monthly average</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'operations' && (
            <motion.div
              key="operations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Operations Metrics */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3" />
                  Operations Dashboard
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{mockPerformanceData.contractors.active.toLocaleString()}</div>
                    <div className="text-white/60 text-sm">Active Contractors</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Briefcase className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{mockPerformanceData.projects.inProgress.toLocaleString()}</div>
                    <div className="text-white/60 text-sm">Active Projects</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">12 min</div>
                    <div className="text-white/60 text-sm">Avg Response</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">94.7%</div>
                    <div className="text-white/60 text-sm">Completion Rate</div>
                  </div>
                </div>

                <div className="aspect-square bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Project Distribution</h3>
                    <p className="text-white/70">By category and status</p>
                  </div>
                </div>
              </div>

              {/* Efficiency Metrics */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Zap className="w-6 h-6 mr-3" />
                  Efficiency Analysis
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Booking Conversion Rate</span>
                      <span className="text-2xl font-bold text-green-400">68%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-[68%]" />
                    </div>
                    <div className="text-green-400 text-sm mt-1">+5% this month</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Platform Utilization</span>
                      <span className="text-2xl font-bold text-blue-400">82%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[82%]" />
                    </div>
                    <div className="text-blue-400 text-sm mt-1">Optimal range</div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Resource Efficiency</span>
                      <span className="text-2xl font-bold text-purple-400">91%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full w-[91%]" />
                    </div>
                    <div className="text-purple-400 text-sm mt-1">Above target</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'quality' && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Quality Metrics */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-3" />
                  Quality Metrics
                </h2>
                
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white mb-2">
                      {mockPerformanceData.quality.overallScore}
                    </div>
                    <div className="flex justify-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(mockPerformanceData.quality.overallScore)
                              ? 'text-yellow-400 fill-current'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-white/70">Overall Quality Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Client Satisfaction</span>
                      <span className="text-xl font-bold text-green-400">96.3%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-[96%]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">On-Time Delivery</span>
                      <span className="text-xl font-bold text-blue-400">94.7%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[95%]" />
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80">Dispute Rate</span>
                      <span className="text-xl font-bold text-green-400">1.2%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full w-[12%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Trends */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  Quality Trends
                </h2>
                
                <div className="aspect-video bg-gradient-to-br from-yellow-900/50 to-green-900/50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Quality Trend Analysis</h3>
                    <p className="text-white/70 mb-4">Rating trends and improvement metrics</p>
                    <div className="text-green-400 text-2xl font-bold">+0.3 Rating Increase</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* AI Insights Header */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Brain className="w-6 h-6 mr-3" />
                    AI-Powered Insights
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-white/60 text-sm">Last updated: 2 min ago</div>
                    <button className="w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
                      <RefreshCw className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                <p className="text-white/80">
                  Our AI analyzes 50+ data points including market trends, seasonal patterns, contractor performance, 
                  and client behavior to provide actionable business insights.
                </p>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-3xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h3 className="text-lg font-bold text-white">{insight.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(insight.impact)}`}>
                              {insight.impact.toUpperCase()} IMPACT
                            </div>
                            <div className="text-white/60 text-sm">
                              {insight.confidence}% confidence
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {insight.estimatedValue && (
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            +${insight.estimatedValue.toLocaleString()}
                          </div>
                          <div className="text-white/60 text-sm">Est. Value</div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-white/80 mb-4">{insight.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-white/70 text-sm font-semibold">Recommended Actions:</div>
                      {insight.actionItems.map((action, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/70 text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}