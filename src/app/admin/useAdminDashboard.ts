
"use client";
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  email?: string;
  name?: string;
}
interface Provider {
  id: string;
  email?: string;
  name?: string;
}
export function useAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = getSupabase();
      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      if (usersError) {
        setUsers([]);
        setLoading(false);
        return;
      }
      const { data: providersData, error: providersError } = await supabase.from('providers').select('*');
      if (providersError) {
        setProviders([]);
        setLoading(false);
        return;
      }
      setUsers(usersData || []);
      setProviders(providersData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return { users, providers, loading };
}
