import type { NextApiRequest, NextApiResponse } from 'next';

const RATE_LIMIT = 100; // requests per 15 min
const WINDOW = 15 * 60 * 1000;
const ipMap = new Map<string, { count: number; start: number }>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '';
  const now = Date.now();
  const entry = ipMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count++;
  ipMap.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  res.status(200).json({ ok: true });
}
