"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  CreditCard,
  Receipt,
  Calculator,
  FileText,
  Banknote,
  Wallet,
  Building,
  Globe,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  Shield,
  Activity,
  Layers,
  Database,
  Server,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cpu,
  HardDrive,
  Network,
  Wifi,
  Signal,
  Battery,
  Power,
  Lightbulb,
  Flame,
  Snowflake
} from 'lucide-react';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
  period: string;
  target?: number;
}

interface Transaction {
  id: string;
  type: 'revenue' | 'expense' | 'transfer' | 'refund';
  amount: number;
  currency: string;
  description: string;
  category: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  paymentMethod: string;
  merchantFee?: number;
  taxAmount?: number;
}

interface RevenueStream {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  growth: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface PaymentProcessor {
  id: string;
  name: string;
  type: 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'crypto';
  status: 'active' | 'inactive' | 'maintenance';
  volume: number;
  fees: number;
  successRate: number;
  avgProcessingTime: number;
  currencies: string[];
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on_track' | 'over_budget' | 'under_budget';
  forecast: number;
}

const mockFinancialMetrics: FinancialMetric[] = [
  {
    id: '1',
    name: 'Total Revenue',
    value: 2847500,
    previousValue: 2456000,
    unit: '$',
    format: 'currency',
    trend: 'up',
    period: 'This Month',
    target: 3000000
  },
  {
    id: '2',
    name: 'Net Profit Margin',
    value: 23.4,
    previousValue: 21.8,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    period: 'This Quarter'
  },
  {
    id: '3',
    name: 'Operating Expenses',
    value: 1847200,
    previousValue: 1923400,
    unit: '$',
    format: 'currency',
    trend: 'down',
    period: 'This Month'
  },
  {
    id: '4',
    name: 'Cash Flow',
    value: 847300,
    previousValue: 623100,
    unit: '$',
    format: 'currency',
    trend: 'up',
    period: 'This Month'
  },
  {
    id: '5',
    name: 'Customer LTV',
    value: 4250,
    previousValue: 3890,
    unit: '$',
    format: 'currency',
    trend: 'up',
    period: 'Average'
  },
  {
    id: '6',
    name: 'Payment Success Rate',
    value: 98.7,
    previousValue: 97.9,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    period: 'This Month'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'revenue',
    amount: 2850.00,
    currency: 'USD',
    description: 'Kitchen Renovation Project - Final Payment',
    category: 'Home Renovation',
    timestamp: Date.now() - 300000,
    status: 'completed',
    paymentMethod: 'Credit Card',
    merchantFee: 85.50,
    taxAmount: 285.00
  },
  {
    id: '2',
    type: 'expense',
    amount: 450.00,
    currency: 'USD',
    description: 'Contractor Insurance Premium',
    category: 'Insurance',
    timestamp: Date.now() - 1800000,
    status: 'completed',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: '3',
    type: 'revenue',
    amount: 1250.00,
    currency: 'USD',
    description: 'Plumbing Repair Service',
    category: 'Plumbing',
    timestamp: Date.now() - 3600000,
    status: 'processing',
    paymentMethod: 'Digital Wallet',
    merchantFee: 37.50,
    taxAmount: 125.00
  },
  {
    id: '4',
    type: 'refund',
    amount: 350.00,
    currency: 'USD',
    description: 'Cancelled Electrical Work',
    category: 'Electrical',
    timestamp: Date.now() - 7200000,
    status: 'completed',
    paymentMethod: 'Credit Card'
  }
];

const mockRevenueStreams: RevenueStream[] = [
  {
    id: '1',
    name: 'Home Renovation',
    amount: 1250000,
    percentage: 44,
    growth: 18.5,
    color: '#3B82F6',
    trend: 'up'
  },
  {
    id: '2',
    name: 'Maintenance Services',
    amount: 680000,
    percentage: 24,
    growth: 12.3,
    color: '#10B981',
    trend: 'up'
  },
  {
    id: '3',
    name: 'Emergency Repairs',
    amount: 520000,
    percentage: 18,
    growth: -5.2,
    color: '#F59E0B',
    trend: 'down'
  },
  {
    id: '4',
    name: 'Consultation Services',
    amount: 280000,
    percentage: 10,
    growth: 25.7,
    color: '#8B5CF6',
    trend: 'up'
  },
  {
    id: '5',
    name: 'Premium Support',
    amount: 117500,
    percentage: 4,
    growth: 45.2,
    color: '#EF4444',
    trend: 'up'
  }
];

const mockPaymentProcessors: PaymentProcessor[] = [
  {
    id: '1',
    name: 'Stripe',
    type: 'credit_card',
    status: 'active',
    volume: 1850000,
    fees: 55500,
    successRate: 98.7,
    avgProcessingTime: 2.3,
    currencies: ['USD', 'EUR', 'GBP', 'CAD']
  },
  {
    id: '2',
    name: 'PayPal',
    type: 'digital_wallet',
    status: 'active',
    volume: 620000,
    fees: 24800,
    successRate: 97.2,
    avgProcessingTime: 3.1,
    currencies: ['USD', 'EUR', 'GBP']
  },
  {
    id: '3',
    name: 'ACH Direct',
    type: 'bank_transfer',
    status: 'active',
    volume: 280000,
    fees: 2800,
    successRate: 99.1,
    avgProcessingTime: 24.0,
    currencies: ['USD']
  },
  {
    id: '4',
    name: 'Apple Pay',
    type: 'digital_wallet',
    status: 'active',
    volume: 97500,
    fees: 2925,
    successRate: 99.3,
    avgProcessingTime: 1.8,
    currencies: ['USD', 'EUR', 'GBP']
  }
];

const mockBudgetCategories: BudgetCategory[] = [
  {
    id: '1',
    name: 'Marketing & Advertising',
    allocated: 250000,
    spent: 187500,
    remaining: 62500,
    percentage: 75,
    status: 'on_track',
    forecast: 240000
  },
  {
    id: '2',
    name: 'Technology & Infrastructure',
    allocated: 180000,
    spent: 195000,
    remaining: -15000,
    percentage: 108,
    status: 'over_budget',
    forecast: 210000
  },
  {
    id: '3',
    name: 'Human Resources',
    allocated: 420000,
    spent: 312000,
    remaining: 108000,
    percentage: 74,
    status: 'on_track',
    forecast: 400000
  },
  {
    id: '4',
    name: 'Operations',
    allocated: 150000,
    spent: 98000,
    remaining: 52000,
    percentage: 65,
    status: 'under_budget',
    forecast: 130000
  }
];

const FinancialMetricCard: React.FC<{ metric: FinancialMetric }> = ({ metric }) => {
  const formatValue = (value: number) => {
    switch (metric.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getChangePercentage = () => {
    return ((metric.value - metric.previousValue) / metric.previousValue * 100).toFixed(1);
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-yellow-400';
    }
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up': return <ArrowUp className="w-4 h-4" />;
      case 'down': return <ArrowDown className="w-4 h-4" />;
      case 'stable': return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">{getChangePercentage()}%</span>
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-2">
        {formatValue(metric.value)}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm">{metric.period}</span>
        {metric.target && (
          <span className="text-white/60 text-sm">
            Target: {formatValue(metric.target)}
          </span>
        )}
      </div>

      {metric.target && (
        <div className="mt-3">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            />
          </div>
          <div className="text-xs text-white/60 mt-1">
            {((metric.value / metric.target) * 100).toFixed(1)}% of target
          </div>
        </div>
      )}
    </motion.div>
  );
};

const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const getTypeColor = () => {
    switch (transaction.type) {
      case 'revenue': return 'text-green-400 bg-green-500/20';
      case 'expense': return 'text-red-400 bg-red-500/20';
      case 'transfer': return 'text-blue-400 bg-blue-500/20';
      case 'refund': return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'processing': return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'revenue': return <TrendingUp className="w-4 h-4" />;
      case 'expense': return <TrendingDown className="w-4 h-4" />;
      case 'transfer': return <ArrowUp className="w-4 h-4" />;
      case 'refund': return <ArrowDown className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div>
            <h4 className="text-white font-semibold">{transaction.description}</h4>
            <p className="text-white/60 text-sm">{transaction.category}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">
            {transaction.type === 'expense' || transaction.type === 'refund' ? '-' : '+'}
            ${transaction.amount.toLocaleString()}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
            {transaction.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">{transaction.paymentMethod}</span>
        <span className="text-white/60">
          {new Date(transaction.timestamp).toLocaleString()}
        </span>
      </div>

      {(transaction.merchantFee || transaction.taxAmount) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs text-white/60">
            {transaction.merchantFee && (
              <span>Fee: ${transaction.merchantFee.toFixed(2)}</span>
            )}
            {transaction.taxAmount && (
              <span>Tax: ${transaction.taxAmount.toFixed(2)}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const RevenueStreamChart: React.FC<{ streams: RevenueStream[] }> = ({ streams }) => {
  return (
    <div className="space-y-4">
      {streams.map((stream, index) => (
        <motion.div
          key={stream.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: stream.color }}
              />
              <span className="text-white font-semibold">{stream.name}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                ${stream.amount.toLocaleString()}
              </div>
              <div className={`text-sm ${
                stream.trend === 'up' ? 'text-green-400' : 
                stream.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {stream.growth > 0 ? '+' : ''}{stream.growth.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stream.percentage}%` }}
              transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
              className="h-2 rounded-full"
              style={{ backgroundColor: stream.color }}
            />
          </div>

          <div className="text-xs text-white/60">
            {stream.percentage}% of total revenue
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const PaymentProcessorCard: React.FC<{ processor: PaymentProcessor }> = ({ processor }) => {
  const getStatusColor = () => {
    switch (processor.status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'inactive': return 'text-red-400 bg-red-500/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getTypeIcon = () => {
    switch (processor.type) {
      case 'credit_card': return <CreditCard className="w-5 h-5" />;
      case 'bank_transfer': return <Building className="w-5 h-5" />;
      case 'digital_wallet': return <Wallet className="w-5 h-5" />;
      case 'crypto': return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">{processor.name}</h3>
            <p className="text-white/60 text-sm capitalize">{processor.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {processor.status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-white">
            ${processor.volume.toLocaleString()}
          </div>
          <div className="text-white/60 text-sm">Volume</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {processor.successRate}%
          </div>
          <div className="text-white/60 text-sm">Success Rate</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/60">Fees:</span>
          <span className="text-white">${processor.fees.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Avg Processing:</span>
          <span className="text-white">{processor.avgProcessingTime}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Currencies:</span>
          <span className="text-white">{processor.currencies.join(', ')}</span>
        </div>
      </div>
    </motion.div>
  );
};

const BudgetCategoryCard: React.FC<{ category: BudgetCategory }> = ({ category }) => {
  const getStatusColor = () => {
    switch (category.status) {
      case 'on_track': return 'text-green-400 bg-green-500/20';
      case 'over_budget': return 'text-red-400 bg-red-500/20';
      case 'under_budget': return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getProgressColor = () => {
    if (category.percentage > 100) return 'bg-red-500';
    if (category.percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
          {category.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/60">Allocated:</span>
          <span className="text-white font-semibold">
            ${category.allocated.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Spent:</span>
          <span className="text-white font-semibold">
            ${category.spent.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Remaining:</span>
          <span className={`font-semibold ${
            category.remaining >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${Math.abs(category.remaining).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-sm">Progress</span>
          <span className="text-white font-semibold text-sm">
            {category.percentage}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(category.percentage, 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-2 rounded-full ${getProgressColor()}`}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Forecast:</span>
          <span className="text-white">
            ${category.forecast.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function EnterpriseFinancialCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'revenue' | 'payments' | 'budget'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const totalRevenue = mockFinancialMetrics.find(m => m.name === 'Total Revenue')?.value || 0;
  const totalExpenses = mockFinancialMetrics.find(m => m.name === 'Operating Expenses')?.value || 0;
  const netProfit = totalRevenue - totalExpenses;

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
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Financial Operations
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Real-time financial processing, revenue optimization, and advanced payment systems 
            with enterprise-grade accounting automation and business intelligence.
          </p>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-card p-6 rounded-3xl text-center">
            <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-green-400 font-semibold">Total Revenue</div>
          </div>

          <div className="glass-card p-6 rounded-3xl text-center">
            <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              ${totalExpenses.toLocaleString()}
            </div>
            <div className="text-red-400 font-semibold">Operating Expenses</div>
          </div>

          <div className="glass-card p-6 rounded-3xl text-center">
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <div className="text-3xl font-bold text-white mb-2">
              ${netProfit.toLocaleString()}
            </div>
            <div className="text-blue-400 font-semibold">Net Profit</div>
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
                    ? 'bg-green-500 text-white shadow-lg'
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: Receipt },
              { id: 'revenue', label: 'Revenue Streams', icon: TrendingUp },
              { id: 'payments', label: 'Payment Processing', icon: CreditCard },
              { id: 'budget', label: 'Budget Management', icon: Calculator }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
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
              {mockFinancialMetrics.map((metric, index) => (
                <FinancialMetricCard key={metric.id} metric={metric} />
              ))}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
                <div className="flex space-x-3">
                  <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    <Filter className="w-4 h-4" />
                  </button>
                  <button className="glass-card px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockTransactions.map((transaction, index) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'revenue' && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6">Revenue Breakdown</h2>
                <RevenueStreamChart streams={mockRevenueStreams} />
              </div>

              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold text-white mb-6">Revenue Analytics</h2>
                
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        ${mockRevenueStreams.reduce((sum, stream) => sum + stream.amount, 0).toLocaleString()}
                      </div>
                      <div className="text-white/80">Total Revenue</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Highest Growth:</span>
                      <span className="text-green-400 font-semibold">Premium Support (+45.2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Largest Stream:</span>
                      <span className="text-blue-400 font-semibold">Home Renovation (44%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Average Growth:</span>
                      <span className="text-white font-semibold">+19.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {mockPaymentProcessors.map((processor, index) => (
                <PaymentProcessorCard key={processor.id} processor={processor} />
              ))}
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {mockBudgetCategories.map((category, index) => (
                <BudgetCategoryCard key={category.id} category={category} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}