import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, contractor_id, milestone_id, description } = await request.json();

    // Validate required fields
    if (!amount || !contractor_id || !milestone_id) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, contractor_id, milestone_id' },
        { status: 400 }
      );
    }

    // Get contractor's Stripe Connect account
    const { data: contractor } = await supabase
      .from('contractor_profiles')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', contractor_id)
      .single();

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    // Check if contractor has Stripe Connect account
    let stripeAccountId = contractor.stripe_account_id;
    
    if (!stripeAccountId) {
      // Create Stripe Express account for contractor
      const account = await stripe.accounts.create({
        type: 'express',
        email: contractor.users.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          email: contractor.users.email,
          first_name: contractor.users.first_name,
          last_name: contractor.users.last_name,
        },
        metadata: {
          contractor_id: contractor_id,
          platform: 'booklocal'
        }
      });

      stripeAccountId = account.id;

      // Update contractor profile with Stripe account ID
      await supabase
        .from('contractor_profiles')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', contractor_id);
    }

    // Check if account is ready for payouts
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    if (!account.payouts_enabled) {
      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/contractor/onboarding/stripe-refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/contractor/dashboard`,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        success: false,
        error: 'Contractor needs to complete Stripe onboarding',
        onboarding_url: accountLink.url,
        account_id: stripeAccountId
      });
    }

    // Calculate platform fee (5% of gross amount)
    const platformFee = Math.round(amount * 0.05);
    const contractorAmount = amount - platformFee;

    // Create transfer to contractor
    const transfer = await stripe.transfers.create({
      amount: contractorAmount,
      currency: 'usd',
      destination: stripeAccountId,
      metadata: {
        contractor_id,
        milestone_id,
        type: 'milestone_payment'
      },
      description: description || 'Milestone payment'
    });

    // Create payout to contractor's bank account
    const payout = await stripe.payouts.create({
      amount: contractorAmount,
      currency: 'usd',
      method: 'instant', // Try instant payout, fall back to standard
      metadata: {
        contractor_id,
        milestone_id,
        transfer_id: transfer.id
      }
    }, {
      stripeAccount: stripeAccountId
    });

    return NextResponse.json({
      success: true,
      payout_id: payout.id,
      transfer_id: transfer.id,
      amount: contractorAmount,
      platform_fee: platformFee,
      status: payout.status,
      arrival_date: payout.arrival_date
    });

  } catch (error) {
    console.error('Payout creation error:', error);
    
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
    service: 'Payout Creation',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}