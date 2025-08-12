// Stripe payment integration stub
// Replace with your Stripe publishable key and backend API
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');
  await stripe.redirectToCheckout({ sessionId });
}
