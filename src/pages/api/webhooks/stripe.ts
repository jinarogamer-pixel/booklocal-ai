import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { withRateLimit } from '../../../lib/rate-limit';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: (process.env.STRIPE_API_VERSION as unknown as Stripe.LatestApiVersion) || undefined,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  // Rate limit webhook endpoint (100 per minute - webhooks can be frequent)
  const allowed = await withRateLimit(req, res, {
    limit: 100,
    windowSeconds: 60,
    identifier: 'stripe-webhook',
  });

  if (!allowed) {
    return; // withRateLimit already sent the response
  }

  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).json({ error: 'Missing stripe signature' });

  let buf: Buffer;
  try {
    buf = await getRawBody(req as unknown as NodeJS.ReadableStream) as Buffer;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to read raw body', err);
    return res.status(400).json({ error: 'Invalid body' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Webhook signature verification failed', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // eslint-disable-next-line no-console
  console.log('[AUDIT] Stripe event:', event.type);

  switch (event.type) {
    case 'payment_intent.succeeded':
      // handle payment success
      break;
    case 'invoice.paid':
      // handle invoice paid
      break;
    default:
      // eslint-disable-next-line no-console
      console.log('Unhandled event type', event.type);
  }

  res.status(200).json({ received: true });
}