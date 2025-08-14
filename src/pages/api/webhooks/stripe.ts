import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).json({ error: 'Missing stripe signature' });

  let buf: Buffer;
  try {
    buf = await getRawBody(req);
  } catch (err) {
    console.error('Failed to read raw body', err);
    return res.status(400).json({ error: 'Invalid body' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log('[AUDIT] Stripe event:', event.type);

  switch (event.type) {
    case 'payment_intent.succeeded':
      // handle payment success
      break;
    case 'invoice.paid':
      // handle invoice paid
      break;
    default:
      console.log('Unhandled event type', event.type);
  }

  res.status(200).json({ received: true });
}