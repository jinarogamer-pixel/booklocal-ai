// API endpoint for creating Stripe checkout sessions
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createCheckoutSession, SUBSCRIPTION_PLANS } from '../../../lib/subscriptions';
import { withRateLimit } from '../../../lib/rate-limit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit subscription creation (5 per minute)
  const allowed = await withRateLimit(req, res, {
    limit: 5,
    windowSeconds: 60,
    identifier: 'subscription-checkout',
  });

  if (!allowed) {
    return; // withRateLimit already sent the response
  }

  try {
    // Verify user session
    const session = await getServerSession(req, res, authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId } = req.body;
    
    if (!planId || !SUBSCRIPTION_PLANS.find(p => p.id === planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const successUrl = `${protocol}://${host}/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${protocol}://${host}/payments`;

    const sessionId = await createCheckoutSession(
      userId,
      planId,
      successUrl,
      cancelUrl
    );

    res.json({ sessionId });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
