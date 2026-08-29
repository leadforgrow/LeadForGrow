import { decrypt } from '@/lib/encryption';

/**
 * Thin wrapper around Razorpay Payment Links API.
 * Deliberately uses `fetch` with the business's own keys via HTTP Basic auth —
 * no `razorpay` SDK dependency, keeps the bundle small and side-steps the
 * SDK's implicit config-file lookups (dangerous for a multi-tenant SaaS
 * where each request must scope to a different customer's account).
 *
 * `getRazorpayClient(business)` returns { createLink, cancelLink, fetchLink,
 * verifyWebhook } bound to the business's own keys.
 */
export function getRazorpayClient(business) {
  const rzp = business?.integrationCredentials?.razorpay;
  if (!rzp?.enabled || !rzp.keyId || !rzp.keySecret) {
    throw new Error('Razorpay is not connected for this business');
  }
  let keySecret;
  try {
    keySecret = decrypt(rzp.keySecret);
  } catch {
    throw new Error('Razorpay key secret failed to decrypt — reconnect Razorpay in Settings');
  }
  const auth = 'Basic ' + Buffer.from(`${rzp.keyId}:${keySecret}`).toString('base64');
  const base = 'https://api.razorpay.com/v1';

  async function call(method, path, body) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.description || data?.error?.reason || `Razorpay ${method} ${path} failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.details = data?.error || data;
      throw err;
    }
    return data;
  }

  return {
    /**
     * Create a Payment Link. Amount is in RUPEES here — we convert to paise.
     * Options passed through to Razorpay untouched (Razorpay ignores unknown
     * keys), so callers can pass expire_by, notify, options.checkout etc.
     */
    createLink({ amount, description, customerName, customerPhone, customerEmail, referenceId, notes, extra }) {
      const paise = Math.round(Number(amount) * 100);
      const payload = {
        amount: paise,
        currency: 'INR',
        accept_partial: false,
        description: (description || '').slice(0, 2048),
        customer: {
          name:  customerName || undefined,
          contact: (customerPhone || '').replace(/[^\d]/g, '') || undefined,
          email: customerEmail || undefined,
        },
        // Reference id (unique per business) — we use "BILL-<billNumber>" so we
        // can trace a webhook event back to our record without a lookup table.
        reference_id: referenceId,
        notify: { sms: false, email: false }, // we deliver via WhatsApp ourselves
        reminder_enable: false,
        notes: notes || {},
        ...(extra || {}),
      };
      return call('POST', '/payment_links', payload);
    },
    cancelLink(linkId) { return call('POST', `/payment_links/${linkId}/cancel`); },
    fetchLink(linkId) { return call('GET', `/payment_links/${linkId}`); },
  };
}

/**
 * Verify a Razorpay webhook signature. Called from /api/webhooks/razorpay.
 * The webhook secret is set in the Razorpay dashboard AND stored on the
 * business here — we HMAC the raw request body and compare.
 *
 * Returns true if the signature matches, false otherwise. Never throws
 * (caller should reject with 400 on false).
 */
export function verifyRazorpaySignature({ rawBody, signature, webhookSecret }) {
  try {
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature || '')));
  } catch {
    return false;
  }
}
