// API route: /api/log-error
// Receives error reports from captureError and forwards to Sentry or logs to console
import type { NextApiRequest, NextApiResponse } from 'next';

// 1. Integrate with Sentry backend (uncomment and configure as needed)
// import * as Sentry from '@sentry/node';
// if (process.env.SENTRY_DSN) {
//   Sentry.init({ dsn: process.env.SENTRY_DSN });
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { error, context, env, timestamp, fingerprint } = req.body || {};
  let eventId: string | undefined = undefined;
  
  try {
    // 2. Forward to Sentry if configured
    // if (Sentry.getCurrentHub().getClient()) {
    //   eventId = Sentry.captureException(error, {
    //     extra: context,
    //     user: context?.user,
    //     fingerprint,
    //     tags: { env, timestamp },
    //   });
    // }
    
    // 3. Enhanced fallback: log to server console with more detail
    if (!eventId) {
      const logEntry = {
        timestamp: timestamp || new Date().toISOString(),
        error: error || 'Unknown error',
        context: context || {},
        env: env || 'unknown',
        fingerprint: fingerprint || [],
        source: 'api-log-error'
      };
      
      console.error('[API /api/log-error] Error captured:', JSON.stringify(logEntry, null, 2));
      
      // Generate a simple event ID for tracking
      eventId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    res.status(200).json({ ok: true, eventId });
  } catch (err) {
    console.error('[API /api/log-error] Failed to log error:', err);
    
    // Even if logging fails, try to provide some response
    const fallbackEventId = `fallback-${Date.now()}`;
    res.status(500).json({ 
      error: 'Failed to log error', 
      eventId: fallbackEventId,
      originalError: error 
    });
  }
}
