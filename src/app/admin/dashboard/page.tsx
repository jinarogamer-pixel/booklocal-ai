"use client";

import { useEffect, useState } from 'react';

type Metrics = {
  totalBookings?: number;
  revenue?: number;
  activeUsers?: number;
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/metrics')
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({ error: r.statusText }));
          throw new Error(err?.error || r.statusText);
        }
        return r.json();
      })
      .then((data) => {
        if (mounted) setMetrics(data);
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || 'Failed to load metrics');
      });
    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-gray-600">Ensure you are signed in as an admin user.</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8">Loading metrics...</div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-500">Total Bookings</div>
          <div className="text-3xl font-semibold">{metrics.totalBookings ?? 0}</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-500">Revenue (cents)</div>
          <div className="text-3xl font-semibold">${{}.toString() /* placeholder */}</div>
          <div className="text-xl">{typeof metrics.revenue === 'number' ? `$${(metrics.revenue/100).toFixed(2)}` : '$0.00'}</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-sm text-gray-500">Active Users (30d)</div>
          <div className="text-3xl font-semibold">{metrics.activeUsers ?? 0}</div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm text-gray-600">This dashboard is minimal — extend with charts and tables as needed.</p>
      </div>
    </div>
  );
}
