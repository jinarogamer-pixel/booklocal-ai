"use client";
import AnalyticsCharts from './AnalyticsCharts';
import { useProviderAnalytics } from './useProviderAnalytics';

export default function ProviderAnalytics() {
  const { data, loading } = useProviderAnalytics();
  if (loading) return <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>Loading...</div>;
  if (!data) return <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>No analytics data found.</div>;
  // Transform bookings to the expected format for AnalyticsCharts
  // If Booking does not have month/count, adapt as needed
  const bookingsByMonth = Array.isArray(data.bookings)
    ? data.bookings.map((b) => ({
        month: (b as { month?: string }).month ?? (b as { created_at?: string }).created_at?.slice(0, 7) ?? '',
        count: (b as { count?: number }).count ?? 1
      }))
    : [];

  const analyticsData = {
    ...data,
    bookings: bookingsByMonth,
    reviews: Array.isArray(data.reviews) ? data.reviews.length : 0,
    avgRating: typeof data.avgRating === 'number' ? data.avgRating : Number(data.avgRating) || 0
  };

  return (
    <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Provider Analytics</h1>
      <ul style={{ marginBottom: '2rem', paddingLeft: 20 }}>
        <li>• Bookings: {data.bookings.length}</li>
        <li>• Revenue: ${data.revenue.toLocaleString()}</li>
        <li>• Reviews: {data.reviews.length}</li>
        <li>• Average rating: {data.avgRating}</li>
      </ul>
      <AnalyticsCharts data={analyticsData} />
    </div>
  );
}
