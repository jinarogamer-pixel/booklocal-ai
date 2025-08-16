"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers,
  Plug,
  Settings,
  Shield,
  Key,
  Database,
  Globe,
  Building,
  Users,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  Code,
  Terminal,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  Webhook,
  Cpu,
  Cloud,
  Zap,
  Target,
  Link,
  Server,
  Monitor,
  FileText,
  Bell,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Briefcase,
  Award,
  Star
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description: string;
  category: 'contractors' | 'projects' | 'payments' | 'users' | 'analytics';
  rateLimit: number;
  authRequired: boolean;
  status: 'active' | 'deprecated' | 'beta';
}

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'accounting' | 'communication' | 'analytics' | 'storage';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: React.ElementType;
  description: string;
  features: string[];
  lastSync?: string;
  syncFrequency: string;
  dataExchanged: number;
}

interface WhiteLabelClient {
  id: string;
  companyName: string;
  domain: string;
  customization: {
    primaryColor: string;
    logo: string;
    branding: string;
  };
  features: string[];
  users: number;
  projects: number;
  revenue: number;
  status: 'active' | 'trial' | 'suspended';
  tier: 'basic' | 'professional' | 'enterprise';
}

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth' | 'oidc' | 'ldap';
  status: 'active' | 'inactive' | 'error';
  users: number;
  lastLogin?: string;
  icon: React.ElementType;
}

const mockAPIEndpoints: APIEndpoint[] = [
  {
    id: '1',
    name: 'Get Contractors',
    method: 'GET',
    endpoint: '/api/v1/contractors',
    description: 'Retrieve list of verified contractors with filtering options',
    category: 'contractors',
    rateLimit: 1000,
    authRequired: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'Create Project',
    method: 'POST',
    endpoint: '/api/v1/projects',
    description: 'Create a new project with contractor assignment',
    category: 'projects',
    rateLimit: 100,
    authRequired: true,
    status: 'active'
  },
  {
    id: '3',
    name: 'Process Payment',
    method: 'POST',
    endpoint: '/api/v1/payments',
    description: 'Process escrow or direct payments with fraud detection',
    category: 'payments',
    rateLimit: 50,
    authRequired: true,
    status: 'active'
  },
  {
    id: '4',
    name: 'Analytics Data',
    method: 'GET',
    endpoint: '/api/v1/analytics/dashboard',
    description: 'Retrieve comprehensive analytics and performance metrics',
    category: 'analytics',
    rateLimit: 500,
    authRequired: true,
    status: 'beta'
  }
];

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Salesforce CRM',
    type: 'crm',
    status: 'connected',
    icon: Building,
    description: 'Sync customer data and project information with Salesforce',
    features: ['Contact Sync', 'Lead Management', 'Project Tracking', 'Custom Fields'],
    lastSync: '2024-01-20T14:30:00Z',
    syncFrequency: 'Every 15 minutes',
    dataExchanged: 15847
  },
  {
    id: '2',
    name: 'QuickBooks Online',
    type: 'accounting',
    status: 'connected',
    icon: CreditCard,
    description: 'Automated invoice generation and expense tracking',
    features: ['Invoice Sync', 'Expense Tracking', 'Tax Reporting', 'Payment Reconciliation'],
    lastSync: '2024-01-20T13:45:00Z',
    syncFrequency: 'Daily at 2 AM',
    dataExchanged: 8934
  },
  {
    id: '3',
    name: 'Slack Workspace',
    type: 'communication',
    status: 'connected',
    icon: Mail,
    description: 'Real-time project notifications and team communication',
    features: ['Project Alerts', 'Status Updates', 'File Sharing', 'Team Channels'],
    lastSync: '2024-01-20T14:25:00Z',
    syncFrequency: 'Real-time',
    dataExchanged: 3421
  },
  {
    id: '4',
    name: 'Google Analytics',
    type: 'analytics',
    status: 'connected',
    icon: BarChart3,
    description: 'Track user behavior and platform performance metrics',
    features: ['User Tracking', 'Conversion Analytics', 'Custom Events', 'Goal Tracking'],
    lastSync: '2024-01-20T14:00:00Z',
    syncFrequency: 'Hourly',
    dataExchanged: 12563
  },
  {
    id: '5',
    name: 'AWS S3 Storage',
    type: 'storage',
    status: 'connected',
    icon: Cloud,
    description: 'Secure file storage for project documents and media',
    features: ['File Backup', 'CDN Distribution', 'Encryption', 'Version Control'],
    lastSync: '2024-01-20T14:35:00Z',
    syncFrequency: 'Continuous',
    dataExchanged: 45672
  }
];

const mockWhiteLabelClients: WhiteLabelClient[] = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    domain: 'services.techcorp.com',
    customization: {
      primaryColor: '#2563eb',
      logo: '/logos/techcorp.png',
      branding: 'TechCorp Services'
    },
    features: ['Full Platform', 'Custom Branding', 'API Access', 'White-label Mobile App'],
    users: 2847,
    projects: 15632,
    revenue: 450000,
    status: 'active',
    tier: 'enterprise'
  },
  {
    id: '2',
    companyName: 'BuildRight Inc',
    domain: 'contractors.buildright.io',
    customization: {
      primaryColor: '#059669',
      logo: '/logos/buildright.png',
      branding: 'BuildRight Network'
    },
    features: ['Core Platform', 'Custom Branding', 'Basic API'],
    users: 1203,
    projects: 7845,
    revenue: 180000,
    status: 'active',
    tier: 'professional'
  },
  {
    id: '3',
    companyName: 'HomeServices Pro',
    domain: 'platform.homeservices.com',
    customization: {
      primaryColor: '#7c3aed',
      logo: '/logos/homeservices.png',
      branding: 'HomeServices Platform'
    },
    features: ['Core Platform', 'Limited Branding'],
    users: 456,
    projects: 2134,
    revenue: 45000,
    status: 'trial',
    tier: 'basic'
  }
];

const mockSSOProviders: SSOProvider[] = [
  {
    id: '1',
    name: 'Microsoft Azure AD',
    type: 'saml',
    status: 'active',
    users: 1847,
    lastLogin: '2024-01-20T14:30:00Z',
    icon: Building
  },
  {
    id: '2',
    name: 'Google Workspace',
    type: 'oauth',
    status: 'active',
    users: 923,
    lastLogin: '2024-01-20T14:25:00Z',
    icon: Globe
  },
  {
    id: '3',
    name: 'Okta Identity',
    type: 'oidc',
    status: 'active',
    users: 567,
    lastLogin: '2024-01-20T14:20:00Z',
    icon: Shield
  }
];

export default function EnterpriseIntegrationHub() {
  const [activeTab, setActiveTab] = useState<'api' | 'integrations' | 'whitelabel' | 'sso'>('api');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [apiKey] = useState('bk_live_sk_1234567890abcdef...');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected': return 'text-green-400 bg-green-500/20';
      case 'inactive':
      case 'disconnected': return 'text-gray-400 bg-gray-500/20';
      case 'error':
      case 'suspended': return 'text-red-400 bg-red-500/20';
      case 'pending':
      case 'trial': return 'text-yellow-400 bg-yellow-500/20';
      case 'beta': return 'text-blue-400 bg-blue-500/20';
      case 'deprecated': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-500/20';
      case 'POST': return 'text-blue-400 bg-blue-500/20';
      case 'PUT': return 'text-yellow-400 bg-yellow-500/20';
      case 'DELETE': return 'text-red-400 bg-red-500/20';
      case 'PATCH': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'text-purple-400 bg-purple-500/20';
      case 'professional': return 'text-blue-400 bg-blue-500/20';
      case 'basic': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
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
              Enterprise Integration
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Comprehensive API ecosystem, white-label solutions, and enterprise integrations 
            to seamlessly connect BookLocal with your existing business infrastructure.
          </p>
        </motion.div>

        {/* Integration Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'API Endpoints', 
              value: '47', 
              icon: Plug, 
              color: 'text-blue-400',
              change: '+3 this month'
            },
            { 
              label: 'Active Integrations', 
              value: '12', 
              icon: Layers, 
              color: 'text-green-400',
              change: '100% uptime'
            },
            { 
              label: 'White-label Clients', 
              value: '8', 
              icon: Building, 
              color: 'text-purple-400',
              change: '+2 this quarter'
            },
            { 
              label: 'SSO Users', 
              value: '3.2K', 
              icon: Shield, 
              color: 'text-yellow-400',
              change: '+15% growth'
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
              { id: 'api', label: 'API Management', icon: Code },
              { id: 'integrations', label: 'Integrations', icon: Plug },
              { id: 'whitelabel', label: 'White-label', icon: Building },
              { id: 'sso', label: 'SSO & Security', icon: Shield }
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
          {activeTab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* API Endpoints List */}
              <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Terminal className="w-6 h-6 mr-3" />
                    API Endpoints
                  </h2>
                  <button className="btn-quantum flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Endpoint</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {mockAPIEndpoints.map((endpoint, index) => (
                    <motion.div
                      key={endpoint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                        selectedEndpoint?.id === endpoint.id
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </div>
                          <div className="text-white font-semibold">{endpoint.name}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(endpoint.status)}`}>
                          {endpoint.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="text-white/60 font-mono text-sm mb-2">
                        {endpoint.endpoint}
                      </div>

                      <div className="text-white/70 text-sm mb-3">
                        {endpoint.description}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/60">
                          Rate limit: {endpoint.rateLimit}/hour
                        </div>
                        <div className="flex items-center space-x-2">
                          {endpoint.authRequired ? (
                            <div className="flex items-center space-x-1 text-yellow-400">
                              <Lock className="w-4 h-4" />
                              <span>Auth Required</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-green-400">
                              <Unlock className="w-4 h-4" />
                              <span>Public</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* API Documentation & Tools */}
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Configuration
                </h3>

                {/* API Key Management */}
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold">API Key</span>
                      <button
                        onClick={() => setShowAPIKey(!showAPIKey)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {showAPIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 font-mono text-sm text-white/80">
                      {showAPIKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                    </div>
                    <button
                      onClick={() => copyToClipboard(apiKey)}
                      className="mt-2 w-full glass-card px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Key</span>
                    </button>
                  </div>

                  {/* API Stats */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h4 className="text-white font-semibold mb-3">Usage Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Requests Today</span>
                        <span className="text-white font-semibold">15,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Rate Limit</span>
                        <span className="text-green-400 font-semibold">10,000/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Success Rate</span>
                        <span className="text-green-400 font-semibold">99.8%</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                      <FileText className="w-5 h-5" />
                      <span>API Documentation</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </button>
                    
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                      <Download className="w-5 h-5" />
                      <span>Download SDK</span>
                    </button>
                    
                    <button className="w-full glass-card px-4 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-3">
                      <Terminal className="w-5 h-5" />
                      <span>API Explorer</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Connected Integrations */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Plug className="w-6 h-6 mr-3" />
                    Active Integrations
                  </h2>
                  <button className="btn-quantum flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Integration</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {mockIntegrations.map((integration, index) => (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <integration.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{integration.name}</h3>
                            <p className="text-white/70 text-sm">{integration.description}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(integration.status)}`}>
                          {integration.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-white/60 text-sm">Last Sync</div>
                          <div className="text-white font-semibold">
                            {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60 text-sm">Data Exchanged</div>
                          <div className="text-white font-semibold">
                            {integration.dataExchanged.toLocaleString()} records
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {integration.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-xs">
                            {feature}
                          </span>
                        ))}
                        {integration.features.length > 3 && (
                          <span className="text-white/60 text-xs">+{integration.features.length - 3} more</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                          Sync: {integration.syncFrequency}
                        </div>
                        <div className="flex space-x-2">
                          <button className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                            <Settings className="w-4 h-4 text-white" />
                          </button>
                          <button className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                            <RefreshCw className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Integration Marketplace */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Globe className="w-6 h-6 mr-3" />
                  Integration Marketplace
                </h2>

                <div className="space-y-4">
                  {[
                    { name: 'HubSpot CRM', type: 'CRM', description: 'Advanced customer relationship management', icon: Building },
                    { name: 'Xero Accounting', type: 'Accounting', description: 'Automated bookkeeping and invoicing', icon: CreditCard },
                    { name: 'Microsoft Teams', type: 'Communication', description: 'Team collaboration and messaging', icon: Users },
                    { name: 'Tableau Analytics', type: 'Analytics', description: 'Advanced data visualization', icon: BarChart3 },
                    { name: 'Dropbox Business', type: 'Storage', description: 'Secure file storage and sharing', icon: Cloud }
                  ].map((integration, index) => (
                    <motion.div
                      key={integration.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                            <integration.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{integration.name}</h4>
                            <p className="text-white/60 text-sm">{integration.description}</p>
                          </div>
                        </div>
                        <button className="btn-quantum px-4 py-2 text-sm">
                          Connect
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button className="glass-card px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    Browse All Integrations
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'whitelabel' && (
            <motion.div
              key="whitelabel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* White-label Overview */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Building className="w-6 h-6 mr-3" />
                    White-label Clients
                  </h2>
                  <button className="btn-quantum flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Client</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {mockWhiteLabelClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: client.customization.primaryColor }}
                          >
                            {client.companyName.substring(0, 2)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{client.companyName}</h3>
                            <p className="text-white/60 text-sm">{client.domain}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                          {client.status.toUpperCase()}
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block ${getTierColor(client.tier)}`}>
                        {client.tier.toUpperCase()} TIER
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{client.users.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{client.projects.toLocaleString()}</div>
                          <div className="text-white/60 text-xs">Projects</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">${(client.revenue / 1000).toFixed(0)}K</div>
                          <div className="text-white/60 text-xs">Revenue</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {client.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-white/80 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 glass-card px-3 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm">
                          Manage
                        </button>
                        <button className="flex-1 glass-card px-3 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm">
                          Analytics
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* White-label Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-3xl">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Layers className="w-6 h-6 mr-3" />
                    Platform Features
                  </h3>

                  <div className="space-y-4">
                    {[
                      { name: 'Custom Branding', description: 'Full brand customization with logos, colors, and themes' },
                      { name: 'Domain Mapping', description: 'Custom domain configuration with SSL certificates' },
                      { name: 'API Access', description: 'Full API access with custom rate limits' },
                      { name: 'Mobile Apps', description: 'White-labeled iOS and Android applications' },
                      { name: 'Analytics Dashboard', description: 'Comprehensive business intelligence and reporting' },
                      { name: 'Multi-tenant Architecture', description: 'Isolated data and user management per client' }
                    ].map((feature, index) => (
                      <div key={feature.name} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                          <div>
                            <h4 className="text-white font-semibold">{feature.name}</h4>
                            <p className="text-white/70 text-sm">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    Pricing Tiers
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        tier: 'Basic',
                        price: '$999',
                        period: 'month',
                        features: ['Core Platform', 'Basic Branding', 'Up to 1,000 users'],
                        color: 'from-green-500 to-green-600'
                      },
                      {
                        tier: 'Professional',
                        price: '$2,499',
                        period: 'month',
                        features: ['Full Platform', 'Custom Branding', 'Up to 5,000 users', 'API Access'],
                        color: 'from-blue-500 to-blue-600'
                      },
                      {
                        tier: 'Enterprise',
                        price: 'Custom',
                        period: 'pricing',
                        features: ['Everything', 'Mobile Apps', 'Unlimited users', 'Dedicated support'],
                        color: 'from-purple-500 to-purple-600'
                      }
                    ].map((tier, index) => (
                      <div key={tier.tier} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-white">{tier.tier}</h4>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{tier.price}</div>
                            <div className="text-white/60 text-sm">/{tier.period}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-white/80 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sso' && (
            <motion.div
              key="sso"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* SSO Providers */}
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Shield className="w-6 h-6 mr-3" />
                    SSO Providers
                  </h2>
                  <button className="btn-quantum flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Provider</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {mockSSOProviders.map((provider, index) => (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            <provider.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                            <p className="text-white/60 text-sm">{provider.type.toUpperCase()} Protocol</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(provider.status)}`}>
                          {provider.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-white/60 text-sm">Active Users</div>
                          <div className="text-white font-semibold">{provider.users.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-white/60 text-sm">Last Login</div>
                          <div className="text-white font-semibold">
                            {provider.lastLogin ? new Date(provider.lastLogin).toLocaleString() : 'Never'}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 glass-card px-3 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm">
                          Configure
                        </button>
                        <button className="flex-1 glass-card px-3 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm">
                          Test
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Lock className="w-6 h-6 mr-3" />
                  Security Configuration
                </h2>

                <div className="space-y-6">
                  {/* Security Policies */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Security Policies</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Multi-Factor Authentication', enabled: true, description: 'Required for all admin accounts' },
                        { name: 'Session Timeout', enabled: true, description: 'Auto-logout after 30 minutes of inactivity' },
                        { name: 'IP Whitelisting', enabled: false, description: 'Restrict access to specific IP ranges' },
                        { name: 'Device Verification', enabled: true, description: 'Verify new devices via email' }
                      ].map((policy, idx) => (
                        <div key={policy.name} className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">{policy.name}</div>
                            <div className="text-white/60 text-sm">{policy.description}</div>
                          </div>
                          <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                            policy.enabled ? 'bg-green-500' : 'bg-gray-600'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 mt-0.5 ${
                              policy.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Status */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Compliance Status</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'SOC 2 Type II', status: 'Certified', color: 'text-green-400' },
                        { name: 'GDPR Compliance', status: 'Compliant', color: 'text-green-400' },
                        { name: 'CCPA Compliance', status: 'Compliant', color: 'text-green-400' },
                        { name: 'ISO 27001', status: 'In Progress', color: 'text-yellow-400' }
                      ].map((compliance, idx) => (
                        <div key={compliance.name} className="flex items-center justify-between">
                          <span className="text-white">{compliance.name}</span>
                          <span className={`font-semibold ${compliance.color}`}>{compliance.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Monitoring */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Security Monitoring</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">0</div>
                        <div className="text-white/60 text-sm">Security Incidents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">99.9%</div>
                        <div className="text-white/60 text-sm">Uptime</div>
                      </div>
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