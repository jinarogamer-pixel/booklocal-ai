import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id, amount, reason } = await request.json();

    // Validate required fields
    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Get the payment intent to validate
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Cannot refund unsuccessful payment' },
        { status: 400 }
      );
    }

    // Create the refund
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: payment_intent_id,
      reason: 'requested_by_customer',
      metadata: {
        refund_reason: reason || 'Customer requested refund',
        refund_type: 'escrow_refund',
        timestamp: new Date().toISOString()
      }
    };

    // If partial refund, specify amount
    if (amount && amount < paymentIntent.amount) {
      refundData.amount = Math.round(amount);
    }

    const refund = await stripe.refunds.create(refundData);

    return NextResponse.json({
      success: true,
      refund_id: refund.id,
      amount: refund.amount,
      status: refund.status,
      reason: refund.reason,
      created: refund.created
    });

  } catch (error) {
    console.error('Refund creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
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
    service: 'Refund Creation',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}