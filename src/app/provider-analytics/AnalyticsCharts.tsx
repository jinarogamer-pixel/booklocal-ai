import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type AnalyticsChartsProps = {
  data: {
    bookings: { month: string; count: number }[];
    revenue: number;
    revenueHistory?: { month: string; amount: number }[];
    reviews: number;
    avgRating: number;
  };
};

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const bookingsData = {
    labels: data.bookings.map((b: { month: string; count: number }) => b.month),
    datasets: [
      {
        label: 'Bookings',
        data: data.bookings.map((b: { month: string; count: number }) => b.count),
        backgroundColor: '#38bdf8',
      },
    ],
  };
  const revenueHistory = data.revenueHistory || data.bookings.map((b, i) => ({ month: b.month, amount: (i+1)*1000 }));
  const revenueData = {
    labels: revenueHistory.map(r => r.month),
    datasets: [
      {
        label: 'Revenue',
        data: revenueHistory.map(r => r.amount),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  return (
    <div style={{ marginTop: 32 }}>
      <Bar data={bookingsData} options={{ plugins: { legend: { display: false } } }} />
      <h2 className="text-lg font-semibold mb-2 mt-8">Revenue (last 6 months)</h2>
      <Line data={revenueData} />
    </div>
  );
}
