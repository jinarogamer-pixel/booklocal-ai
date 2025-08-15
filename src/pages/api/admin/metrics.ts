import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '../../../lib/supabaseClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { withRateLimit } from '../../../lib/rate-limit';

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Rate limit admin endpoints (30 per minute)
  const allowed = await withRateLimit(req, res, {
    limit: 30,
    windowSeconds: 60,
    identifier: 'admin-metrics',
  });

  if (!allowed) {
    return; // withRateLimit already sent the response
  }

  // Verify admin session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !isRecord(session) || !isRecord(session.user)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const user = session.user as Record<string, unknown>;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const supabase = getSupabase();

  try {
    // Get basic metrics
    const [bookingsRes, revenueRes, usersRes] = await Promise.allSettled([
      supabase.from('bookings').select('id, created_at, total_amount, status', { count: 'exact' }),
      supabase.from('bookings').select('total_amount, created_at'),
      supabase.from('users').select('id, created_at', { count: 'exact' }),
    ]);

    // Calculate total bookings
    const totalBookings = bookingsRes.status === 'fulfilled' ? (bookingsRes.value.count ?? 0) : 0;

    // Calculate total revenue
    let revenue = 0;
    if (revenueRes.status === 'fulfilled' && Array.isArray(revenueRes.value.data)) {
      revenue = revenueRes.value.data.reduce((acc: number, row: Record<string, unknown>) => {
        const val = row.total_amount;
        if (typeof val === 'number') return acc + val;
        if (typeof val === 'string') return acc + (Number(val) || 0);
        return acc;
      }, 0);
    }

    // Calculate active users (users with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let activeUsers = 0;
    if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) {
      activeUsers = usersRes.value.data.filter((user: Record<string, unknown>) => {
        const createdAt = user.created_at;
        if (typeof createdAt === 'string') {
          return new Date(createdAt) > thirtyDaysAgo;
        }
        return false;
      }).length;
    }

    // Get recent bookings for activity feed
    let recentBookings: Array<Record<string, unknown>> = [];
    if (bookingsRes.status === 'fulfilled' && Array.isArray(bookingsRes.value.data)) {
      recentBookings = bookingsRes.value.data
        .slice(0, 10)
        .map((booking: Record<string, unknown>) => ({
          id: booking.id,
          created_at: booking.created_at,
          total_amount: booking.total_amount,
          status: booking.status,
        }));
    }

    // Mock additional metrics (replace with real queries as needed)
    const userGrowth = [
      { date: '2024-01-01', count: 12 },
      { date: '2024-01-08', count: 19 },
      { date: '2024-01-15', count: 7 },
      { date: '2024-01-22', count: 15 },
    ];

    const revenueByMonth = [
      { month: 'Jan', revenue: 1200 },
      { month: 'Feb', revenue: 1900 },
      { month: 'Mar', revenue: 3000 },
      { month: 'Apr', revenue: 5000 },
      { month: 'May', revenue: 4000 },
      { month: 'Jun', revenue: 6000 },
    ];

    res.json({
      totalBookings,
      revenue,
      activeUsers,
      recentBookings,
      userGrowth,
      revenueByMonth,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}
