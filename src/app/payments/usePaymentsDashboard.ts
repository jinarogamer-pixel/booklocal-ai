"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
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

  useEffect(() => {
    if (!user) return;
    async function fetchPayments() {
      setLoading(true);
      const { data: payoutsData } = await supabase
        .from('payouts')
        .select('*')
        .eq('provider_id', user!.id);
      const { data: methodsData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user!.id);
      setPayouts(payoutsData || []);
      setMethods(methodsData || []);
      setLoading(false);
    }
    fetchPayments();
  }, [user]);
  return { payouts, methods, loading };
}
