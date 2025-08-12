import { usePaymentsDashboard } from './usePaymentsDashboard';

export default function PayoutHistory() {
  const { payouts, loading } = usePaymentsDashboard();
  return (
    <div className="glass-card mb-6">
      <h2 className="section-title mb-2">Payout History</h2>
      {loading ? <div>Loading...</div> : (
        <ul className="mb-2 list-disc pl-6">
          {payouts.length === 0 && <li>No payouts yet.</li>}
          {payouts.map((p: any) => (
            <li key={p.id}>{p.date || p.created_at}: ${p.amount}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
