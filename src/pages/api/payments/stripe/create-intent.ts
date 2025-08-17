import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      amount,
      currency = 'usd',
      payment_method,
      capture_method = 'automatic',
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!amount || !payment_method) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, payment_method' 
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects amount in cents
      currency,
      payment_method,
      capture_method,
      metadata,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirm`,
    });

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status,
      id: paymentIntent.id
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ 
      error: error.message || 'Payment processing failed' 
    });
  }
}