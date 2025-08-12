import { usePaymentsDashboard } from './usePaymentsDashboard';

export default function PaymentMethods() {
  const { methods, loading } = usePaymentsDashboard();
  return (
    <div className="glass-card">
      <h2 className="section-title mb-2">Payment Methods</h2>
      {loading ? <div>Loading...</div> : (
        <ul className="mb-2 list-disc pl-6">
          {methods.length === 0 && <li>No payment methods.</li>}
          {methods.map((m: any) => (
            <li key={m.id}>{m.brand || 'Card'} •••• {m.last4 || m.id.slice(-4)}</li>
          ))}
        </ul>
      )}
      <button className="btn-primary">Add Payment Method</button>
    </div>
  );
}
