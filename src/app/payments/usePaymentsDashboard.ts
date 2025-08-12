"use client";
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';
import { useUser } from '../components/AuthProvider';

interface PaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
}

interface Payout {
  id: string;
  amount: number;
  date?: string;
  created_at?: string;
  status?: string;
}

export function usePaymentsDashboard() {
  const { user } = useUser();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    async function fetchPayments() {
      setLoading(true);
      setError(null);
      try {
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('payouts')
          .select('*')
          .eq('provider_id', user!.id);
        if (payoutsError) throw payoutsError;
        const { data: methodsData, error: methodsError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user!.id);
        if (methodsError) throw methodsError;
        setPayouts(payoutsData || []);
        setMethods(methodsData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load payment data.');
        setPayouts([]);
        setMethods([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [user]);
  return { payouts, methods, loading, error };
}
