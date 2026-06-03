import Stripe from 'stripe';
import { getEnv } from '@/lib/env';

let _stripe = null;

export function getStripe() {
  const key = getEnv('STRIPE_SECRET_KEY');
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: '2024-11-20.acacia' });
  return _stripe;
}

export async function createCheckoutSession({ businessId, planId, priceId, customerEmail, successUrl, cancelUrl }) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { businessId: businessId.toString(), planId },
    subscription_data: {
      metadata: { businessId: businessId.toString(), planId },
    },
  });

  return session;
}

export async function createBillingPortalSession({ customerId, returnUrl }) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export function verifyStripeWebhook(rawBody, signature) {
  const stripe = getStripe();
  const secret = getEnv('STRIPE_WEBHOOK_SECRET');
  if (!stripe || !secret) throw new Error('Stripe webhook not configured');
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
