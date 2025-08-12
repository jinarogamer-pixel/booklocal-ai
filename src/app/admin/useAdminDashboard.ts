import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: providersData } = await supabase.from('providers').select('*');
      setUsers(usersData || []);
      setProviders(providersData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return { users, providers, loading };
}
