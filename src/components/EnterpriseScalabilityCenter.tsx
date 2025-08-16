"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  Wifi,
  Signal,
  Battery,
  Zap,
  Activity,
  Monitor,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Layers,
  Settings,
  RefreshCw,
  Eye,
  Bell,
  Target,
  Gauge,
  Rocket,
  Shield,
  Lock,
  Key,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Star,
  Flame,
  Snowflake,
  Lightning,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Play,
  Pause,
  Square,
  Search,
  Filter,
  Download,
  Upload,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Camera,
  Mic,
  Speaker,
  Router,
  Antenna,
  Radio,
  Radar,
  Satellite,
  Power,
  Lightbulb
} from 'lucide-react';

interface InfrastructureMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  target?: number;
}

interface CloudResource {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network' | 'database' | 'cache';
  provider: 'AWS' | 'Azure' | 'GCP' | 'Multi-Cloud';
  region: string;
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  utilization: number;
  cost: number;
  autoScaling: boolean;
  instances: number;
}

interface PerformanceAlert {
  id: string;
  type: 'performance' | 'security' | 'availability' | 'cost';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  status: 'active' | 'acknowledged' | 'resolved';
  affectedServices: string[];
  suggestedActions: string[];
}

interface ScalingEvent {
  id: string;
  type: 'scale_up' | 'scale_down' | 'scale_out' | 'scale_in';
  resource: string;
  trigger: string;
  timestamp: number;
  oldValue: number;
  newValue: number;
  reason: string;
  costImpact: number;
}

const mockInfrastructureMetrics: InfrastructureMetric[] = [
  {
    id: '1',
    name: 'CPU Utilization',
    value: 68,
    unit: '%',
    status: 'healthy',
    trend: 'stable',
    threshold: 80,
    target: 70
  },
  {
    id: '2',
    name: 'Memory Usage',
    value: 72,
    unit: '%',
    status: 'healthy',
    trend: 'up',
    threshold: 85,
    target: 75
  },
  {
    id: '3',
    name: 'Network Throughput',
    value: 847,
    unit: 'Mbps',
    status: 'healthy',
    trend: 'up',
    threshold: 1000
  },
  {
    id: '4',
    name: 'Disk I/O',
    value: 1247,
    unit: 'IOPS',
    status: 'warning',
    trend: 'up',
    threshold: 1500
  },
  {
    id: '5',
    name: 'Response Time',
    value: 234,
    unit: 'ms',
    status: 'healthy',
    trend: 'down',
    threshold: 500,
    target: 200
  },
  {
    id: '6',
    name: 'Error Rate',
    value: 0.12,
    unit: '%',
    status: 'healthy',
    trend: 'stable',
    threshold: 1.0,
    target: 0.1
  }
];

const mockCloudResources: CloudResource[] = [
  {
    id: '1',
    name: 'Web Application Cluster',
    type: 'compute',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'running',
    utilization: 68,
    cost: 2847.50,
    autoScaling: true,
    instances: 12
  },
  {
    id: '2',
    name: 'Primary Database',
    type: 'database',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'running',
    utilization: 45,
    cost: 1250.00,
    autoScaling: false,
    instances: 3
  },
  {
    id: '3',
    name: 'Redis Cache Cluster',
    type: 'cache',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'running',
    utilization: 32,
    cost: 450.00,
    autoScaling: true,
    instances: 6
  },
  {
    id: '4',
    name: 'File Storage',
    type: 'storage',
    provider: 'Multi-Cloud',
    region: 'global',
    status: 'running',
    utilization: 78,
    cost: 890.00,
    autoScaling: true,
    instances: 1
  },
  {
    id: '5',
    name: 'CDN Network',
    type: 'network',
    provider: 'Multi-Cloud',
    region: 'global',
    status: 'running',
    utilization: 56,
    cost: 340.00,
    autoScaling: true,
    instances: 25
  }
];

const mockPerformanceAlerts: PerformanceAlert[] = [
  {
    id: '1',
    type: 'performance',
    severity: 'medium',
    title: 'High Disk I/O Detected',
    description: 'Database disk I/O has exceeded 80% of capacity',
    timestamp: Date.now() - 300000,
    status: 'active',
    affectedServices: ['Database Cluster', 'API Gateway'],
    suggestedActions: ['Scale up storage', 'Optimize queries', 'Add read replicas']
  },
  {
    id: '2',
    type: 'cost',
    severity: 'low',
    title: 'Cost Optimization Opportunity',
    description: 'Unused compute instances detected in development environment',
    timestamp: Date.now() - 1800000,
    status: 'acknowledged',
    affectedServices: ['Dev Environment'],
    suggestedActions: ['Schedule automatic shutdown', 'Resize instances', 'Review usage patterns']
  },
  {
    id: '3',
    type: 'availability',
    severity: 'high',
    title: 'Failover System Test Required',
    description: 'Automated failover system has not been tested in 30 days',
    timestamp: Date.now() - 3600000,
    status: 'active',
    affectedServices: ['Primary Database', 'Load Balancer'],
    suggestedActions: ['Schedule failover test', 'Update disaster recovery plan', 'Verify backup integrity']
  }
];

const mockScalingEvents: ScalingEvent[] = [
  {
    id: '1',
    type: 'scale_out',
    resource: 'Web Application Cluster',
    trigger: 'CPU > 75%',
    timestamp: Date.now() - 900000,
    oldValue: 8,
    newValue: 12,
    reason: 'High traffic during peak hours',
    costImpact: 156.80
  },
  {
    id: '2',
    type: 'scale_up',
    resource: 'Redis Cache Cluster',
    trigger: 'Memory > 80%',
    timestamp: Date.now() - 3600000,
    oldValue: 4,
    newValue: 6,
    reason: 'Increased cache usage from new features',
    costImpact: 89.40
  },
  {
    id: '3',
    type: 'scale_in',
    resource: 'Development Environment',
    trigger: 'Low utilization detected',
    timestamp: Date.now() - 7200000,
    oldValue: 6,
    newValue: 2,
    reason: 'Off-hours automatic scaling',
    costImpact: -145.20
  }
];

const InfrastructureMetricCard: React.FC<{ metric: InfrastructureMetric }> = ({ metric }) => {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'healthy': return 'text-green-400 border-green-400/30 bg-green-500/10';
      case 'warning': return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10';
      case 'critical': return 'text-red-400 border-red-400/30 bg-red-500/10';
    }
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getProgressPercentage = () => {
    return (metric.value / metric.threshold) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border rounded-2xl p-6 ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{metric.name}</h3>
        {getTrendIcon()}
      </div>

      <div className="text-3xl font-bold mb-2">
        {metric.value}{metric.unit}
      </div>

      <div className="w-full bg-white/10 rounded-full h-2 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-2 rounded-full ${
            metric.status === 'healthy' ? 'bg-green-500' :
            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="opacity-80">Threshold: {metric.threshold}{metric.unit}</span>
        {metric.target && (
          <span className="opacity-80">Target: {metric.target}{metric.unit}</span>
        )}
      </div>
    </motion.div>
  );
};

const CloudResourceCard: React.FC<{ resource: CloudResource }> = ({ resource }) => {
  const getStatusColor = () => {
    switch (resource.status) {
      case 'running': return 'text-green-400 bg-green-500/20';
      case 'stopped': return 'text-red-400 bg-red-500/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
    }
  };

  const getTypeIcon = () => {
    switch (resource.type) {
      case 'compute': return <Cpu className="w-5 h-5" />;
      case 'storage': return <HardDrive className="w-5 h-5" />;
      case 'network': return <Network className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'cache': return <Zap className="w-5 h-5" />;
    }
  };

  const getProviderColor = () => {
    switch (resource.provider) {
      case 'AWS': return 'text-orange-400 bg-orange-500/20';
      case 'Azure': return 'text-blue-400 bg-blue-500/20';
      case 'GCP': return 'text-green-400 bg-green-500/20';
      case 'Multi-Cloud': return 'text-purple-400 bg-purple-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">{resource.name}</h3>
            <p className="text-white/60 text-sm capitalize">{resource.type}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {resource.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-white/60 text-sm">Utilization</div>
          <div className="text-2xl font-bold text-white">{resource.utilization}%</div>
        </div>
        <div>
          <div className="text-white/60 text-sm">Monthly Cost</div>
          <div className="text-2xl font-bold text-white">${resource.cost.toFixed(2)}</div>
        </div>
      </div>

      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${resource.utilization}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-2 rounded-full ${
            resource.utilization > 80 ? 'bg-red-500' :
            resource.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getProviderColor()}`}>
            {resource.provider}
          </div>
          <span className="text-white/60">{resource.region}</span>
        </div>
        <div className="flex items-center space-x-2">
          {resource.autoScaling && (
            <div className="text-blue-400 text-xs">Auto-scaling</div>
          )}
          <span className="text-white/60">{resource.instances} instances</span>
        </div>
      </div>
    </motion.div>
  );
};

const PerformanceAlertCard: React.FC<{ alert: PerformanceAlert }> = ({ alert }) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'low': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
    }
  };

  const getStatusColor = () => {
    switch (alert.status) {
      case 'active': return 'text-red-400 bg-red-500/20';
      case 'acknowledged': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
    }
  };

  const getTypeIcon = () => {
    switch (alert.type) {
      case 'performance': return <Gauge className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'availability': return <Activity className="w-5 h-5" />;
      case 'cost': return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-6 ${getSeverityColor()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="font-semibold">{alert.title}</h3>
            <p className="text-sm opacity-80">{alert.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {alert.status.toUpperCase()}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium mb-1">Affected Services:</div>
          <div className="flex flex-wrap gap-2">
            {alert.affectedServices.map((service, idx) => (
              <span key={idx} className="bg-white/10 px-2 py-1 rounded-lg text-xs">
                {service}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Suggested Actions:</div>
          <div className="space-y-1">
            {alert.suggestedActions.map((action, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs opacity-60">
          {new Date(alert.timestamp).toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
};

const ScalingEventCard: React.FC<{ event: ScalingEvent }> = ({ event }) => {
  const getTypeColor = () => {
    switch (event.type) {
      case 'scale_up':
      case 'scale_out':
        return 'text-green-400 bg-green-500/20';
      case 'scale_down':
      case 'scale_in':
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getTypeIcon = () => {
    switch (event.type) {
      case 'scale_up': return <ArrowUp className="w-4 h-4" />;
      case 'scale_down': return <ArrowDown className="w-4 h-4" />;
      case 'scale_out': return <Plus className="w-4 h-4" />;
      case 'scale_in': return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div>
            <h4 className="text-white font-semibold">{event.resource}</h4>
            <p className="text-white/60 text-sm">{event.trigger}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">
            {event.oldValue} → {event.newValue}
          </div>
          <div className={`text-sm ${
            event.costImpact > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {event.costImpact > 0 ? '+' : ''}${event.costImpact.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="text-white/70 text-sm mb-2">{event.reason}</div>

      <div className="text-xs text-white/60">
        {new Date(event.timestamp).toLocaleString()}
      </div>
    </motion.div>
  );
};

export default function EnterpriseScalabilityCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'alerts' | 'scaling'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const totalCost = mockCloudResources.reduce((sum, resource) => sum + resource.cost, 0);
  const totalInstances = mockCloudResources.reduce((sum, resource) => sum + resource.instances, 0);
  const activeAlerts = mockPerformanceAlerts.filter(alert => alert.status === 'active').length;

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
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scalability & Performance
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Intelligent cloud infrastructure with predictive auto-scaling, 
            comprehensive monitoring, and enterprise-grade performance optimization.
          </p>
        </motion.div>

        {/* Infrastructure Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass-card p-6 rounded-3xl text-center">
            <Cloud className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              ${totalCost.toFixed(0)}
            </div>
            <div className="text-blue-400 font-semibold">Monthly Cost</div>
          </div>

          <div className="glass-card p-6 rounded-3xl text-center">
            <Server className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              {totalInstances}
            </div>
            <div className="text-green-400 font-semibold">Active Instances</div>
          </div>

          <div className="glass-card p-6 rounded-3xl text-center">
            <Bell className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              {activeAlerts}
            </div>
            <div className="text-yellow-400 font-semibold">Active Alerts</div>
          </div>

          <div className="glass-card p-6 rounded-3xl text-center">
            <Gauge className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              99.9%
            </div>
            <div className="text-purple-400 font-semibold">Uptime</div>
          </div>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card rounded-3xl p-2 flex space-x-2">
            {[
              { id: '1h', label: '1 Hour' },
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' }
            ].map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id as any)}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 ${
                  selectedTimeframe === timeframe.id
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
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
              { id: 'overview', label: 'Performance Overview', icon: Monitor },
              { id: 'resources', label: 'Cloud Resources', icon: Cloud },
              { id: 'alerts', label: 'Intelligent Alerts', icon: Bell },
              { id: 'scaling', label: 'Auto-Scaling Events', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white shadow-lg'
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {mockInfrastructureMetrics.map((metric, index) => (
                <InfrastructureMetricCard key={metric.id} metric={metric} />
              ))}
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Cloud Infrastructure</h2>
                <div className="flex space-x-3">
                  <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockCloudResources.map((resource, index) => (
                  <CloudResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Performance Alerts</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-white/60 text-sm">
                    {activeAlerts} active alerts
                  </div>
                  <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockPerformanceAlerts.map((alert, index) => (
                  <PerformanceAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'scaling' && (
            <motion.div
              key="scaling"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Auto-Scaling Events</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-white/60 text-sm">
                    Last 24 hours
                  </div>
                  <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockScalingEvents.map((event, index) => (
                  <ScalingEventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Scaling Summary */}
              <div className="glass-card p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Scaling Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {mockScalingEvents.filter(e => e.type.includes('up') || e.type.includes('out')).length}
                    </div>
                    <div className="text-white/80">Scale Up Events</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {mockScalingEvents.filter(e => e.type.includes('down') || e.type.includes('in')).length}
                    </div>
                    <div className="text-white/80">Scale Down Events</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      ${mockScalingEvents.reduce((sum, e) => sum + e.costImpact, 0).toFixed(2)}
                    </div>
                    <div className="text-white/80">Cost Impact</div>
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