import AnalyticsCharts from './AnalyticsCharts';
import { useProviderAnalytics } from './useProviderAnalytics';

export default function ProviderAnalytics() {
  const { data, loading } = useProviderAnalytics();
  if (loading) return <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>Loading...</div>;
  if (!data) return <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>No analytics data found.</div>;
  return (
    <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Provider Analytics</h1>
      <ul style={{ marginBottom: '2rem', paddingLeft: 20 }}>
        <li>• Bookings: {data.bookings.length}</li>
        <li>• Revenue: ${data.revenue.toLocaleString()}</li>
        <li>• Reviews: {data.reviews.length}</li>
        <li>• Average rating: {data.avgRating}</li>
      </ul>
      <AnalyticsCharts data={data} />
    </div>
  );
}
