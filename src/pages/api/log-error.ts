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
  const eventId: string | undefined = undefined;
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
    // 3. Fallback: log to server console
    if (!eventId) {
      console.error('[API /api/log-error]', { error, context, env, timestamp, fingerprint });
    }
    res.status(200).json({ ok: true, eventId });
  } catch (err) {
    console.error('[API /api/log-error] Failed to log error:', err);
    res.status(500).json({ error: 'Failed to log error' });
  }
}
