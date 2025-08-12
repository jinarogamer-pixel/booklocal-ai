import { usePaymentsDashboard } from './usePaymentsDashboard';

interface PaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
}
export default function PaymentMethods() {
  const { methods, loading, error } = usePaymentsDashboard();
  return (
    <div className="glass-card">
      <h2 className="section-title mb-2">Payment Methods</h2>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <ul className="mb-2 list-disc pl-6">
          {methods.length === 0 && <li>No payment methods.</li>}
          {methods.map((m: PaymentMethod) => (
            <li key={m.id}>{m.brand || 'Card'} •••• {m.last4 || m.id.slice(-4)}</li>
          ))}
        </ul>
      )}
      <button className="btn-primary">Add Payment Method</button>
    </div>
  );
}
