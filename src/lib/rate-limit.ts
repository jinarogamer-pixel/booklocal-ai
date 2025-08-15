import { Redis } from '@upstash/redis';

// Simple fallback for when Redis is not configured
const mockRedis = {
  incr: async () => 1,
  expire: async () => true,
  get: async () => null,
  set: async () => true,
};

let redis: Redis | typeof mockRedis;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('⚠️ Redis not configured, using mock (rate limiting disabled)');
    redis = mockRedis;
  }
} catch (error) {
  console.warn('⚠️ Redis connection failed, using mock:', error);
  redis = mockRedis;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

/**
 * Simple rate limiter using Redis
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Number of requests allowed
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  try {
    const key = `rl:${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    const remaining = Math.max(0, limit - current);
    const resetTime = Date.now() + (windowSeconds * 1000);
    
    return {
      success: current <= limit,
      remaining,
      resetTime,
      totalHits: current,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    
    // Fail open - allow request if Redis is down
    return {
      success: true,
      remaining: limit,
      resetTime: Date.now() + (windowSeconds * 1000),
      totalHits: 0,
    };
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: { headers: Record<string, unknown>; socket?: { remoteAddress?: string } }): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress;
  return ip || 'unknown';
}

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  req: { headers: Record<string, unknown>; socket?: { remoteAddress?: string } },
  res: { setHeader: (name: string, value: string | number) => void; status: (code: number) => { json: (data: unknown) => void } },
  options: {
    limit?: number;
    windowSeconds?: number;
    identifier?: string;
    skipOnError?: boolean;
  } = {}
): Promise<boolean> {
  const {
    limit = 60,
    windowSeconds = 60,
    identifier,
    skipOnError = true,
  } = options;

  try {
    const clientIP = getClientIP(req);
    const rateLimitId = identifier || `ip:${clientIP}`;
    
    const result = await rateLimit(rateLimitId, limit, windowSeconds);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.success) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    
    if (skipOnError) {
      return true; // Allow request to continue
    }
    
    res.status(500).json({ error: 'Rate limiting service unavailable' });
    return false;
  }
}
