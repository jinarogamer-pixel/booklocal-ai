import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '../../../lib/supabaseClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin session
  const session = await getServerSession(req, res, authOptions as any);
  if (!session || (session as any).user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const supabase = getSupabase();

  try {
    const bookingsRes = await supabase.from('bookings').select('id', { count: 'exact' });
    const revenueRes = await supabase.from('bookings').select('total_amount');

    const totalBookings = bookingsRes.count ?? 0;
    const revenue = (revenueRes.data || []).reduce((acc: number, row: any) => acc + (row?.total_amount || 0), 0);

    // Simple active users (last 30 days)
    const activeUsersRes = await supabase.rpc('get_active_user_count');
    const activeUsers = Array.isArray(activeUsersRes) ? activeUsersRes.length : 0;

    res.json({
      totalBookings,
      revenue,
      activeUsers,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
