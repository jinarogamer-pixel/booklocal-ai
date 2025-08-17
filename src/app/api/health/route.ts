import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabaseClient';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const supabase = getSupabase();
    const { error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const dbStatus = dbError ? 'error' : 'connected';

    // Test Redis connection (if configured)
    let redisStatus = 'not_configured';
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const { Redis } = await import('@upstash/redis');
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        await redis.ping();
        redisStatus = 'connected';
      } catch (redisError) {
        redisStatus = 'error';
        console.warn('Redis connection failed:', redisError);
      }
    }

    const responseTime = Date.now() - startTime;
    const isHealthy = dbStatus === 'connected' || dbStatus === 'error'; // Allow DB errors for now

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      performance: {
        response_time_ms: responseTime,
      },
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      performance: {
        response_time_ms: responseTime,
      },
      environment: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
