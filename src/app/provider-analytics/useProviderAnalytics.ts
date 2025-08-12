"use client";
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';
import { useUser } from '../components/AuthProvider';

interface Booking {
  id: string;
  created_at: string;
  amount: number;
}

interface Review {
  id: string;
  rating: number;
}

interface AnalyticsData {
  bookings: Booking[];
  reviews: Review[];
  revenue: number;
  avgRating: string | number;
}

export function useProviderAnalytics() {
  const { user } = useUser();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    const supabase = getSupabase();
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        if (!user) throw new Error('User not found');
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id,created_at,amount')
          .eq('provider_id', user.id);
        if (bookingsError) throw bookingsError;
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id,rating')
          .eq('provider_id', user.id);
        if (reviewsError) throw reviewsError;
        setData({
          bookings: bookings || [],
          reviews: reviews || [],
          revenue: (bookings || []).reduce((sum: number, b: Booking) => sum + (b.amount || 0), 0),
          avgRating: reviews && reviews.length > 0 ? (reviews.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2) : 'N/A',
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load analytics');
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);
  return { data, loading, error };
}
