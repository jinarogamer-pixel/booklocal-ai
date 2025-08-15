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

    // results is unknown[]; check types at runtime
    const zcardResult = results?.[1] as unknown;
    let currentCount = 0;
    if (typeof zcardResult === 'number') {
      currentCount = zcardResult;
    } else if (Array.isArray(zcardResult) && zcardResult.length >= 2) {
      currentCount = Number(zcardResult[1]) || 0;
    } else if (zcardResult && typeof zcardResult === 'object' && 'value' in (zcardResult as Record<string, unknown>)) {
      currentCount = Number((zcardResult as Record<string, unknown>).value ?? 0);
    }

    const allowed = currentCount < limit;

    // Find oldest score to return reset time
    const oldest = await redis.zrange(key, 0, 0, { withScores: true }) as unknown;
    let oldestScore: number | null = null;
    if (Array.isArray(oldest) && oldest.length > 0) {
      const first = oldest[0];
      if (Array.isArray(first) && first.length >= 2) {
        oldestScore = Number(first[1]) || null;
      } else if (first && typeof first === 'object' && 'score' in (first as Record<string, unknown>)) {
        oldestScore = Number((first as Record<string, unknown>).score ?? NaN) || null;
      }
    }

    const resetAt = oldestScore
      ? Math.ceil((oldestScore + windowSeconds * 1000) / 1000)
      : Math.ceil((now + windowSeconds * 1000) / 1000);

    return {
      success: allowed,
      remaining: Math.max(0, limit - currentCount - 1),
      resetAt,
      totalHits: currentCount + 1,
    };
  } catch (err) {
    // Log and fail-open
     
    console.error('Rate limiter error', err);
    return { success: true, remaining: limit, resetAt: Math.ceil((now + windowSeconds * 1000) / 1000), totalHits: 0 };
  }
}
