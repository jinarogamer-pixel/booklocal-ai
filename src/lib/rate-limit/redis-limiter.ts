import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  totalHits: number;
}

export async function rateLimitSliding(identifier: string, limit = 60, windowSeconds = 60): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const key = `rl:${identifier}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zcard(key);
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    pipeline.expire(key, windowSeconds);
    const results = await pipeline.exec();

    const currentCount = (results[1] as number) ?? 0;
    const allowed = currentCount < limit;

    // Find oldest score to return reset time
    const oldest = await redis.zrange(key, 0, 0, { withScores: true });
    const resetAt = oldest?.length && (oldest[0] as any)?.score
      ? Math.ceil(((oldest[0] as any).score + windowSeconds * 1000) / 1000)
      : Math.ceil((now + windowSeconds * 1000) / 1000);

    return {
      success: allowed,
      remaining: Math.max(0, limit - currentCount - 1),
      resetAt,
      totalHits: currentCount + 1,
    };
  } catch (err) {
    console.error('Rate limiter error', err);
    return { success: true, remaining: limit, resetAt: Math.ceil((now + windowSeconds * 1000) / 1000), totalHits: 0 };
  }
}
