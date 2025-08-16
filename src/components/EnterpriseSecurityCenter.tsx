"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Globe,
  Server,
  Database,
  Key,
  Fingerprint,
  Smartphone,
  Wifi,
  Zap,
  Brain,
  Target,
  Bell,
  Settings,
  Monitor,
  FileText,
  Clock,
  MapPin,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  ChevronRight,
  Info,
  X,
  Check,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
  Network,
  HardDrive,
  Cpu,
  MemoryStick,
  Router,
  Radar,
  Crosshair
} from 'lucide-react';

interface SecurityThreat {
  id: string;
  type: 'malware' | 'phishing' | 'ddos' | 'insider' | 'data_breach' | 'unauthorized_access';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'contained' | 'resolved';
  timestamp: number;
  source: string;
  description: string;
  affectedSystems: string[];
  mitigationSteps: string[];
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface ComplianceStatus {
  framework: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  score: number;
  lastAudit: number;
  nextAudit: number;
  findings: number;
  criticalFindings: number;
}

interface ZeroTrustPolicy {
  id: string;
  name: string;
  type: 'identity' | 'device' | 'network' | 'application' | 'data';
  enabled: boolean;
  riskScore: number;
  lastUpdated: number;
  appliedTo: string[];
}

const mockThreats: SecurityThreat[] = [
  {
    id: '1',
    type: 'unauthorized_access',
    severity: 'high',
    status: 'investigating',
    timestamp: Date.now() - 300000,
    source: '192.168.1.45',
    description: 'Multiple failed login attempts detected from suspicious IP',
    affectedSystems: ['User Authentication', 'Admin Panel'],
    mitigationSteps: ['IP blocked', 'User accounts locked', 'Security team notified']
  },
  {
    id: '2',
    type: 'ddos',
    severity: 'medium',
    status: 'contained',
    timestamp: Date.now() - 1800000,
    source: 'Multiple IPs',
    description: 'Distributed denial of service attack on API endpoints',
    affectedSystems: ['API Gateway', 'Load Balancer'],
    mitigationSteps: ['Rate limiting activated', 'CDN protection enabled', 'Traffic rerouted']
  },
  {
    id: '3',
    type: 'phishing',
    severity: 'critical',
    status: 'active',
    timestamp: Date.now() - 600000,
    source: 'email@suspicious-domain.com',
    description: 'Phishing campaign targeting contractor accounts',
    affectedSystems: ['Email System', 'User Accounts'],
    mitigationSteps: ['Email quarantined', 'Users notified', 'Domain blocked']
  }
];

const mockSecurityMetrics: SecurityMetric[] = [
  {
    id: '1',
    name: 'Threat Detection Rate',
    value: 99.7,
    unit: '%',
    trend: 'up',
    status: 'good',
    description: 'Percentage of threats detected by security systems'
  },
  {
    id: '2',
    name: 'Mean Time to Detection',
    value: 4.2,
    unit: 'minutes',
    trend: 'down',
    status: 'good',
    description: 'Average time to detect security incidents'
  },
  {
    id: '3',
    name: 'False Positive Rate',
    value: 2.1,
    unit: '%',
    trend: 'down',
    status: 'good',
    description: 'Percentage of false security alerts'
  },
  {
    id: '4',
    name: 'Security Score',
    value: 94,
    unit: '/100',
    trend: 'up',
    status: 'good',
    description: 'Overall security posture score'
  }
];

const mockComplianceStatus: ComplianceStatus[] = [
  {
    framework: 'SOC 2 Type II',
    status: 'compliant',
    score: 98,
    lastAudit: Date.now() - 7776000000, // 3 months ago
    nextAudit: Date.now() + 15552000000, // 6 months from now
    findings: 2,
    criticalFindings: 0
  },
  {
    framework: 'GDPR',
    status: 'compliant',
    score: 96,
    lastAudit: Date.now() - 5184000000, // 2 months ago
    nextAudit: Date.now() + 31104000000, // 12 months from now
    findings: 3,
    criticalFindings: 0
  },
  {
    framework: 'CCPA',
    status: 'compliant',
    score: 94,
    lastAudit: Date.now() - 2592000000, // 1 month ago
    nextAudit: Date.now() + 31104000000, // 12 months from now
    findings: 4,
    criticalFindings: 1
  },
  {
    framework: 'ISO 27001',
    status: 'partial',
    score: 87,
    lastAudit: Date.now() - 15552000000, // 6 months ago
    nextAudit: Date.now() + 7776000000, // 3 months from now
    findings: 8,
    criticalFindings: 2
  }
];

const mockZeroTrustPolicies: ZeroTrustPolicy[] = [
  {
    id: '1',
    name: 'Multi-Factor Authentication',
    type: 'identity',
    enabled: true,
    riskScore: 15,
    lastUpdated: Date.now() - 86400000,
    appliedTo: ['All Users', 'Admin Accounts', 'Contractor Accounts']
  },
  {
    id: '2',
    name: 'Device Compliance Check',
    type: 'device',
    enabled: true,
    riskScore: 25,
    lastUpdated: Date.now() - 172800000,
    appliedTo: ['Corporate Devices', 'BYOD Devices']
  },
  {
    id: '3',
    name: 'Network Microsegmentation',
    type: 'network',
    enabled: true,
    riskScore: 10,
    lastUpdated: Date.now() - 259200000,
    appliedTo: ['Production Network', 'Development Network', 'Admin Network']
  },
  {
    id: '4',
    name: 'Application Access Control',
    type: 'application',
    enabled: true,
    riskScore: 20,
    lastUpdated: Date.now() - 86400000,
    appliedTo: ['Admin Panel', 'Financial Systems', 'Customer Data']
  }
];

const ThreatCard: React.FC<{ threat: SecurityThreat }> = ({ threat }) => {
  const getSeverityColor = () => {
    switch (threat.severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'low': return 'border-green-500 bg-green-500/10 text-green-400';
    }
  };

  const getStatusColor = () => {
    switch (threat.status) {
      case 'active': return 'text-red-400 bg-red-500/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-500/20';
      case 'contained': return 'text-blue-400 bg-blue-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
    }
  };

  const getThreatIcon = () => {
    switch (threat.type) {
      case 'malware': return <AlertTriangle className="w-5 h-5" />;
      case 'phishing': return <Eye className="w-5 h-5" />;
      case 'ddos': return <Zap className="w-5 h-5" />;
      case 'insider': return <Users className="w-5 h-5" />;
      case 'data_breach': return <Database className="w-5 h-5" />;
      case 'unauthorized_access': return <Lock className="w-5 h-5" />;
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
          {getThreatIcon()}
          <div>
            <h3 className="font-semibold capitalize">{threat.type.replace('_', ' ')}</h3>
            <p className="text-sm opacity-80">{threat.description}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {threat.status.toUpperCase()}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium mb-1">Affected Systems:</div>
          <div className="flex flex-wrap gap-2">
            {threat.affectedSystems.map((system, idx) => (
              <span key={idx} className="bg-white/10 px-2 py-1 rounded-lg text-xs">
                {system}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Mitigation Steps:</div>
          <div className="space-y-1">
            {threat.mitigationSteps.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs opacity-60">
          <span>Source: {threat.source}</span>
          <span>{new Date(threat.timestamp).toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const SecurityMetricCard: React.FC<{ metric: SecurityMetric }> = ({ metric }) => {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'good': return 'text-green-400 border-green-400/30 bg-green-500/10';
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

      <p className="text-sm opacity-80">{metric.description}</p>
    </motion.div>
  );
};

const ComplianceCard: React.FC<{ compliance: ComplianceStatus }> = ({ compliance }) => {
  const getStatusColor = () => {
    switch (compliance.status) {
      case 'compliant': return 'text-green-400 border-green-400/30 bg-green-500/10';
      case 'partial': return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10';
      case 'non_compliant': return 'text-red-400 border-red-400/30 bg-red-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-6 ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{compliance.framework}</h3>
        <div className="text-2xl font-bold">{compliance.score}%</div>
      </div>

      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${compliance.score}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-2 rounded-full bg-current"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="opacity-60">Last Audit</div>
          <div>{new Date(compliance.lastAudit).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="opacity-60">Next Audit</div>
          <div>{new Date(compliance.nextAudit).toLocaleDateString()}</div>
        </div>
        <div>
          <div className="opacity-60">Findings</div>
          <div>{compliance.findings}</div>
        </div>
        <div>
          <div className="opacity-60">Critical</div>
          <div className="text-red-400">{compliance.criticalFindings}</div>
        </div>
      </div>
    </motion.div>
  );
};

const ZeroTrustPolicyCard: React.FC<{ policy: ZeroTrustPolicy; onToggle: () => void }> = ({ policy, onToggle }) => {
  const getRiskColor = () => {
    if (policy.riskScore < 20) return 'text-green-400 bg-green-500/20';
    if (policy.riskScore < 50) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getTypeIcon = () => {
    switch (policy.type) {
      case 'identity': return <Users className="w-5 h-5" />;
      case 'device': return <Smartphone className="w-5 h-5" />;
      case 'network': return <Wifi className="w-5 h-5" />;
      case 'application': return <Monitor className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="font-semibold text-white">{policy.name}</h3>
            <p className="text-sm text-white/60 capitalize">{policy.type} Policy</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor()}`}>
            Risk: {policy.riskScore}
          </div>
          <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors duration-300 ${
              policy.enabled ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 mt-0.5 ${
              policy.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-sm text-white/60">Applied To:</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {policy.appliedTo.map((target, idx) => (
              <span key={idx} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-xs">
                {target}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-white/40">
          Updated: {new Date(policy.lastUpdated).toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
};

export default function EnterpriseSecurityCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'compliance' | 'policies'>('overview');
  const [selectedThreat, setSelectedThreat] = useState<SecurityThreat | null>(null);
  const [policies, setPolicies] = useState(mockZeroTrustPolicies);

  const togglePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, enabled: !policy.enabled, lastUpdated: Date.now() }
        : policy
    ));
  };

  const activeThreatCount = mockThreats.filter(t => t.status === 'active').length;
  const criticalThreatCount = mockThreats.filter(t => t.severity === 'critical').length;

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
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Enterprise Security
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Zero-trust security architecture with advanced threat detection, 
            compliance automation, and enterprise-grade protection systems.
          </p>
        </motion.div>

        {/* Security Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: 'Security Score',
              value: '94/100',
              icon: Shield,
              color: 'text-green-400',
              status: 'Excellent'
            },
            {
              label: 'Active Threats',
              value: activeThreatCount.toString(),
              icon: AlertTriangle,
              color: activeThreatCount > 0 ? 'text-red-400' : 'text-green-400',
              status: activeThreatCount > 0 ? 'Monitoring' : 'Secure'
            },
            {
              label: 'Compliance Status',
              value: '96%',
              icon: CheckCircle,
              color: 'text-green-400',
              status: 'Compliant'
            },
            {
              label: 'Zero Trust Policies',
              value: `${policies.filter(p => p.enabled).length}/${policies.length}`,
              icon: Lock,
              color: 'text-blue-400',
              status: 'Active'
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
              <div className={`text-sm ${stat.color}`}>{stat.status}</div>
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
              { id: 'overview', label: 'Security Overview', icon: Monitor },
              { id: 'threats', label: 'Threat Detection', icon: Radar },
              { id: 'compliance', label: 'Compliance', icon: FileText },
              { id: 'policies', label: 'Zero Trust', icon: Lock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white shadow-lg'
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
              className="space-y-8"
            >
              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockSecurityMetrics.map((metric, index) => (
                  <SecurityMetricCard key={metric.id} metric={metric} />
                ))}
              </div>

              {/* Real-time Security Feed */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3" />
                  Real-time Security Feed
                </h2>
                
                <div className="space-y-4">
                  {[
                    { time: '14:32', event: 'MFA challenge completed successfully', type: 'success' },
                    { time: '14:28', event: 'Suspicious login attempt blocked', type: 'warning' },
                    { time: '14:25', event: 'Compliance scan completed - no issues found', type: 'success' },
                    { time: '14:20', event: 'Zero trust policy updated', type: 'info' },
                    { time: '14:15', event: 'Threat intelligence feed updated', type: 'info' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl"
                    >
                      <div className="text-white/60 text-sm font-mono">{item.time}</div>
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'success' ? 'bg-green-400' :
                        item.type === 'warning' ? 'bg-yellow-400' :
                        item.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                      }`} />
                      <div className="text-white flex-1">{item.event}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'threats' && (
            <motion.div
              key="threats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Threat Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Active Threats', value: activeThreatCount, color: 'text-red-400' },
                  { label: 'Critical Threats', value: criticalThreatCount, color: 'text-orange-400' },
                  { label: 'Threats Resolved Today', value: 12, color: 'text-green-400' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-3xl text-center"
                  >
                    <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Active Threats */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3" />
                  Active Security Threats
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockThreats.map((threat, index) => (
                    <ThreatCard key={threat.id} threat={threat} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Compliance Overview */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3" />
                  Compliance Status Overview
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mockComplianceStatus.map((compliance, index) => (
                    <ComplianceCard key={compliance.framework} compliance={compliance} />
                  ))}
                </div>
              </div>

              {/* Compliance Actions */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6">Required Actions</h2>
                
                <div className="space-y-4">
                  {[
                    { action: 'Update ISO 27001 documentation', priority: 'high', due: '2024-02-15' },
                    { action: 'Conduct CCPA data mapping review', priority: 'medium', due: '2024-02-20' },
                    { action: 'Schedule SOC 2 interim audit', priority: 'low', due: '2024-03-01' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          item.priority === 'high' ? 'bg-red-400' :
                          item.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`} />
                        <span className="text-white">{item.action}</span>
                      </div>
                      <div className="text-white/60 text-sm">Due: {item.due}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'policies' && (
            <motion.div
              key="policies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Zero Trust Overview */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-3" />
                  Zero Trust Security Policies
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {policies.map((policy, index) => (
                    <ZeroTrustPolicyCard 
                      key={policy.id} 
                      policy={policy} 
                      onToggle={() => togglePolicy(policy.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Policy Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-3xl">
                  <h3 className="text-xl font-bold text-white mb-6">Policy Effectiveness</h3>
                  
                  <div className="space-y-4">
                    {[
                      { policy: 'Multi-Factor Authentication', effectiveness: 98, blocked: 247 },
                      { policy: 'Device Compliance', effectiveness: 94, blocked: 89 },
                      { policy: 'Network Microsegmentation', effectiveness: 96, blocked: 156 },
                      { policy: 'Application Access Control', effectiveness: 92, blocked: 203 }
                    ].map((item, index) => (
                      <div key={index} className="bg-white/5 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{item.policy}</span>
                          <span className="text-green-400 font-bold">{item.effectiveness}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${item.effectiveness}%` }}
                          />
                        </div>
                        <div className="text-white/60 text-sm">
                          {item.blocked} threats blocked this month
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl">
                  <h3 className="text-xl font-bold text-white mb-6">Risk Assessment</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">Low Risk</div>
                      <div className="text-white/80">Overall Security Posture</div>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { category: 'Identity & Access', risk: 15, color: 'bg-green-400' },
                        { category: 'Network Security', risk: 10, color: 'bg-green-400' },
                        { category: 'Data Protection', risk: 25, color: 'bg-yellow-400' },
                        { category: 'Application Security', risk: 20, color: 'bg-green-400' }
                      ].map((item, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white text-sm">{item.category}</span>
                            <span className="text-white/80 text-sm">{item.risk}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full ${item.color}`}
                              style={{ width: `${item.risk}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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