"use client";
import StripeConnect from './StripeConnect';
import PayoutHistory from './PayoutHistory';
import PaymentMethods from './PaymentMethods';
import AuthGuard from '../components/AuthGuard';

export default function PaymentsDashboard(_props: unknown) {
  return (
    <AuthGuard>
      <div style={{ maxWidth: 600, margin: '3rem auto' }}>
        <h1 className="hero-title mb-4">Payments & Payouts</h1>
        <StripeConnect />
        <PayoutHistory />
        <PaymentMethods />
      </div>
    </AuthGuard>
  );
}
