import { usePaymentsDashboard } from './usePaymentsDashboard';

interface Payout {
  id: string;
  amount: number;
  date?: string;
  created_at?: string;
  status?: string;
}
export default function PayoutHistory() {
  const { payouts, loading, error } = usePaymentsDashboard();
  return (
    <div className="glass-card mb-6">
      <h2 className="section-title mb-2">Payout History</h2>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <ul className="mb-2 list-disc pl-6">
          {payouts.length === 0 && <li>No payouts yet.</li>}
          {payouts.map((p: Payout) => (
            <li key={p.id}>{p.date || p.created_at}: ${p.amount}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
