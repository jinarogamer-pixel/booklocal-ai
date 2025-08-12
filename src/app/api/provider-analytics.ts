import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Demo data, replace with real DB queries
  res.status(200).json({
    bookings: [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 15 },
      { month: 'May', count: 27 },
      { month: 'Jun', count: 31 },
    ],
    revenue: 23456,
    revenueHistory: [
      { month: 'Jan', amount: 2000 },
      { month: 'Feb', amount: 3200 },
      { month: 'Mar', amount: 4100 },
      { month: 'Apr', amount: 3500 },
      { month: 'May', amount: 4800 },
      { month: 'Jun', amount: 6356 },
    ],
    reviews: 42,
    avgRating: 4.8,
  });
}
