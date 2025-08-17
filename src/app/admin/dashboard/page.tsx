"use client";

import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type Metrics = {
  totalBookings?: number;
  revenue?: number;
  activeUsers?: number;
  recentBookings?: Array<{
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
  }>;
  userGrowth?: Array<{
    date: string;
    count: number;
  }>;
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
  }>;
};

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  color?: string;
};

function MetricCard({ title, value, subtitle, trend, color = "blue" }: MetricCardProps) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50", 
    purple: "border-purple-200 bg-purple-50",
    orange: "border-orange-200 bg-orange-50",
  };

  return (
    <div className={`p-6 border rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      {trend && <div className="text-sm text-green-600 mt-2">↗ {trend}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchMetrics = async () => {
    try {
      const r = await fetch('/api/admin/metrics');
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: r.statusText }));
        throw new Error((err as { error?: string }).error || r.statusText);
      }
      const data = await r.json();
      setMetrics(data);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refreshInterval]);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchMetrics();
  };

  if (loading && !metrics) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-red-500 mt-2">Ensure you are signed in as an admin user.</p>
          <button 
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Mock data for charts (replace with real data)
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [1200, 1900, 3000, 5000, 4000, 6000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userGrowthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 7, 15],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const bookingStatusData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)', 
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time business analytics and metrics</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="text-sm text-gray-500 flex items-center">
            🟢 Live (updates every 30s)
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Bookings" 
          value={metrics?.totalBookings ?? 0}
          subtitle="All time"
          trend="+12% from last month"
          color="blue"
        />
        <MetricCard 
          title="Revenue" 
          value={typeof metrics?.revenue === 'number' ? `$${(metrics.revenue/100).toFixed(2)}` : '$0.00'}
          subtitle="Total earnings"
          trend="+23% from last month"
          color="green"
        />
        <MetricCard 
          title="Active Users" 
          value={metrics?.activeUsers ?? 0}
          subtitle="Last 30 days"
          trend="+8% from last month"
          color="purple"
        />
        <MetricCard 
          title="Conversion Rate" 
          value="3.2%"
          subtitle="Visitors to bookings"
          trend="+0.4% from last month"
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut 
                data={bookingStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white p-6 border rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">User Growth (Weekly)</h3>
        <div className="h-64">
          <Bar 
            data={userGrowthData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">New booking from user #{1000 + i}</span>
              </div>
              <div className="text-xs text-gray-500">
                {i === 0 ? 'Just now' : `${i} min ago`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600 text-sm">⚠️ Some data may be outdated: {error}</p>
        </div>
      )}
    </div>
  );
}
