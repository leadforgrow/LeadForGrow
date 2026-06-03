import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getEnv } from '@/lib/env';

let _razorpay = null;

export function getRazorpay() {
  const keyId = getEnv('RAZORPAY_KEY_ID');
  const keySecret = getEnv('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) return null;
  if (!_razorpay) _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return _razorpay;
}

export async function createRazorpaySubscription({ planId, customerNotify = 1, totalCount = 12 }) {
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error('Razorpay not configured');

  return razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: customerNotify,
    total_count: totalCount,
  });
}

export function verifyRazorpayWebhook(rawBody, signature) {
  const secret = getEnv('RAZORPAY_WEBHOOK_SECRET');
  if (!secret) throw new Error('Razorpay webhook secret not configured');

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected !== signature) throw new Error('Invalid Razorpay webhook signature');
  return JSON.parse(rawBody);
}
