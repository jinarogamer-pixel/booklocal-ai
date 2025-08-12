"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '../components/AuthProvider';

export function useProviderAnalytics() {
  const { user } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    async function fetchAnalytics() {
      setLoading(true);
      // Example: fetch bookings and revenue for this provider
      if (!user) {
        setData(null);
        setLoading(false);
        return;
      }
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id,created_at,amount')
        .eq('provider_id', user.id);
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id,rating')
        .eq('provider_id', user.id);
      setData({
        bookings: bookings || [],
        reviews: reviews || [],
        revenue: (bookings || []).reduce((sum, b) => sum + (b.amount || 0), 0),
        avgRating: reviews && reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2) : 'N/A',
      });
      setLoading(false);
    }
    fetchAnalytics();
  }, [user]);
  return { data, loading };
}
