// Enhanced Stripe subscription and payment processing
import Stripe from 'stripe';
import { getSupabase } from './supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: ['Up to 10 bookings/month', 'Basic analytics', 'Email support'],
    stripeProductId: 'prod_starter',
    stripePriceId: 'price_starter_monthly',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    features: ['Unlimited bookings', 'Advanced analytics', 'Priority support', 'Custom branding'],
    stripeProductId: 'prod_professional',
    stripePriceId: 'price_professional_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: ['Everything in Professional', 'Multi-location support', 'API access', 'Dedicated support'],
    stripeProductId: 'prod_enterprise',
    stripePriceId: 'price_enterprise_monthly',
  },
];

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: undefined, // Will be filled from user data
      metadata: {
        userId,
        planId,
      },
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return session.id;
  } catch (error) {
    console.error('Error creating checkout session:', error, { userId, planId });
    throw error;
  }
}

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(userId: string, email: string, name?: string): Promise<string> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    // Save customer ID to database
    const supabase = getSupabase();
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error, { userId, email });
    throw error;
  }
}

/**
 * Handle subscription webhook events
 */
export async function handleSubscriptionWebhook(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionInDatabase(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await cancelSubscriptionInDatabase(subscription.id);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as (Stripe.Invoice & { subscription?: string | { id: string } }); 
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        if (subscriptionId && invoice.id) {
          await markPaymentSucceeded(subscriptionId, invoice.id);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as (Stripe.Invoice & { subscription?: string | { id: string } }); 
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        if (subscriptionId && invoice.id) {
          await markPaymentFailed(subscriptionId, invoice.id);
        }
        break;
      }
      default:
        console.log(`Unhandled subscription event: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling subscription webhook:', error, { eventType: event.type, eventId: event.id });
    throw error;
  }
}

/**
 * Update subscription in database
 */
async function updateSubscriptionInDatabase(subscription: Stripe.Subscription): Promise<void> {
  const supabase = getSupabase();
  
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    throw new Error(`Customer ${customerId} was deleted`);
  }

  const userId = customer.metadata?.userId;
  if (!userId) {
    throw new Error(`No userId found for customer ${customerId}`);
  }

  const plan = SUBSCRIPTION_PLANS.find(p => 
    subscription.items.data.some(item => item.price.id === p.stripePriceId)
  );

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      status: subscription.status,
      plan_id: plan?.id || 'unknown',
      current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });
}

/**
 * Cancel subscription in database
 */
async function cancelSubscriptionInDatabase(subscriptionId: string): Promise<void> {
  const supabase = getSupabase();
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);
}

/**
 * Mark payment as succeeded
 */
async function markPaymentSucceeded(subscriptionId: string, invoiceId: string): Promise<void> {
  const supabase = getSupabase();
  
  await supabase
    .from('subscription_payments')
    .insert({
      stripe_subscription_id: subscriptionId,
      stripe_invoice_id: invoiceId,
      status: 'succeeded',
      created_at: new Date().toISOString(),
    });
}

/**
 * Mark payment as failed
 */
async function markPaymentFailed(subscriptionId: string, invoiceId: string): Promise<void> {
  const supabase = getSupabase();
  
  await supabase
    .from('subscription_payments')
    .insert({
      stripe_subscription_id: subscriptionId,
      stripe_invoice_id: invoiceId,
      status: 'failed',
      created_at: new Date().toISOString(),
    });
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Create a customer portal session
 */
export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error('Error creating portal session:', error, { customerId });
    throw error;
  }
}
