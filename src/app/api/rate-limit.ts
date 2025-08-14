import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function checkRateLimit(key: string, limit = 100, windowSeconds = 900) {
  const now = Math.floor(Date.now() / 1000);
  const res = await redis.eval<string>(
    `local current = redis.call('INCR', KEYS[1])
     if tonumber(current) == 1 then
       redis.call('EXPIRE', KEYS[1], ARGV[1])
     end
     return current`,
    [key],
    [windowSeconds.toString()]
  );
  const count = parseInt(res || '0', 10);
  return { ok: count <= limit, count };
}

export default async function rateLimit(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
  const { ok, count } = await checkRateLimit(`rl:${ip}`, 100, 900);
  if (!ok) return res.status(429).json({ error: 'Too many requests' });
  return res.status(200).json({ ok: true, remaining: Math.max(0, 100 - count) });
}
