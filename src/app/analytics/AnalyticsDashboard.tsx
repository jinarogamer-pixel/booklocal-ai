"use client";
import { useState, useEffect } from 'react';
import { 
  getAnalyticsMetrics, 
  getBookingAnalytics, 
  AnalyticsMetrics, 
  BookingAnalytics,
  trackEvent 
} from '../../lib/analytics';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    trackEvent('page_view', { page: 'analytics-dashboard' });
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - getDaysFromRange(dateRange) * 24 * 60 * 60 * 1000).toISOString();

      const [metricsData, bookingData] = await Promise.all([
        getAnalyticsMetrics(startDate, endDate),
        getBookingAnalytics(startDate, endDate)
      ]);

      setMetrics(metricsData);
      setBookingAnalytics(bookingData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>📊</div>
          <div>Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.5rem' }}>
          Comprehensive insights into your business performance
        </p>

        {/* Date Range Selector */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                background: dateRange === range ? 'white' : 'rgba(255, 255, 255, 0.2)',
                color: dateRange === range ? '#667eea' : 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {range === '7d' ? 'Last 7 days' : 
               range === '30d' ? 'Last 30 days' :
               range === '90d' ? 'Last 90 days' : 'Last year'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'bookings', label: 'Bookings', icon: '📅' },
            { id: 'revenue', label: 'Revenue', icon: '💰' },
            { id: 'users', label: 'Users', icon: '👥' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: 'transparent',
                color: selectedTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                borderBottom: selectedTab === tab.id ? '2px solid white' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && metrics && (
        <div>
          {/* Key Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Total Users</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
                    {formatNumber(metrics.totalUsers)}
                  </div>
                </div>
                <div style={{ background: '#dbeafe', padding: '0.5rem', borderRadius: '0.5rem' }}>👥</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                +{Math.floor(metrics.totalUsers * 0.12)} this period
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Active Users</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
                    {formatNumber(metrics.activeUsers)}
                  </div>
                </div>
                <div style={{ background: '#dcfce7', padding: '0.5rem', borderRadius: '0.5rem' }}>🟢</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                +{Math.floor(metrics.activeUsers * 0.08)} this period
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Total Revenue</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
                    {formatCurrency(metrics.revenue)}
                  </div>
                </div>
                <div style={{ background: '#fef3c7', padding: '0.5rem', borderRadius: '0.5rem' }}>💰</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                +{Math.floor(metrics.revenue * 0.15)} this period
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Conversion Rate</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
                    {metrics.conversionRate.toFixed(1)}%
                  </div>
                </div>
                <div style={{ background: '#e0e7ff', padding: '0.5rem', borderRadius: '0.5rem' }}>📈</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                +2.3% vs last period
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* User Growth Chart */}
            <div className="glass-card">
              <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>User Growth</h3>
              <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '2px', padding: '1rem 0' }}>
                {metrics.userGrowth.slice(-14).map((point, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                      height: `${(point.users / Math.max(...metrics.userGrowth.map(p => p.users))) * 100}%`,
                      minHeight: '4px',
                      borderRadius: '2px 2px 0 0'
                    }}
                    title={`${point.date}: ${point.users} users`}
                  />
                ))}
              </div>
            </div>

            {/* Revenue Growth Chart */}
            <div className="glass-card">
              <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>Revenue Growth</h3>
              <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '2px', padding: '1rem 0' }}>
                {metrics.revenueGrowth.slice(-14).map((point, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(to top, #10b981, #34d399)',
                      height: `${(point.revenue / Math.max(...metrics.revenueGrowth.map(p => p.revenue))) * 100}%`,
                      minHeight: '4px',
                      borderRadius: '2px 2px 0 0'
                    }}
                    title={`${point.date}: ${formatCurrency(point.revenue)}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="glass-card">
            <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>Top Pages</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {metrics.topPages.map((page, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '0.5rem'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{page.page}</div>
                  <div style={{ color: '#6b7280' }}>{formatNumber(page.views)} views</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {selectedTab === 'bookings' && bookingAnalytics && (
        <div>
          {/* Booking Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Total Bookings</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
                {formatNumber(bookingAnalytics.totalBookings)}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Completed</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginTop: '0.5rem' }}>
                {formatNumber(bookingAnalytics.completedBookings)}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Cancelled</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', marginTop: '0.5rem' }}>
                {formatNumber(bookingAnalytics.cancelledBookings)}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>Avg. Value</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.5rem' }}>
                {formatCurrency(bookingAnalytics.averageBookingValue)}
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>Top Services</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {bookingAnalytics.topServices.map((service, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '0.5rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{service.service}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {service.bookings} bookings
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600' }}>{formatCurrency(service.revenue)}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings by Day */}
          <div className="glass-card">
            <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>Bookings by Day</h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '1rem', padding: '1rem 0' }}>
              {bookingAnalytics.bookingsByDay.map((day, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      background: 'linear-gradient(to top, #8b5cf6, #a78bfa)',
                      height: `${(day.bookings / Math.max(...bookingAnalytics.bookingsByDay.map(d => d.bookings))) * 160}px`,
                      minHeight: '4px',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '0.5rem'
                    }}
                    title={`${day.day}: ${day.bookings} bookings`}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
                    {day.day.slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {selectedTab === 'revenue' && metrics && (
        <div>
          <div className="glass-card">
            <h3 style={{ margin: 0, marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>Revenue Analytics</h3>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                Detailed revenue analytics coming soon...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && metrics && (
        <div>
          <div className="glass-card">
            <h3 style={{ margin: 0, marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>User Analytics</h3>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                Advanced user analytics coming soon...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
