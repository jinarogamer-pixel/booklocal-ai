import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', payment_method, customer_id, metadata } = await request.json();

    // Validate required fields
    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount. Minimum $0.50 required.' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      payment_method,
      customer: customer_id,
      metadata: metadata || {},
      capture_method: 'manual', // For escrow, we'll capture manually after verification
      confirmation_method: 'manual',
      confirm: false,
      setup_future_usage: 'off_session', // Allow saving for future use
    });

    return NextResponse.json({
      success: true,
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    service: 'Payment Intent Creation',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}