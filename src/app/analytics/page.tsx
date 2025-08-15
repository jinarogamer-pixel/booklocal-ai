"use client";
import dynamic from 'next/dynamic';

const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard'), { ssr: false });

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
