import crypto from 'crypto';

/**
 * HMAC-signed unsubscribe tokens so opt-out links in emails are one-click
 * and can't be forged or reused across leads.
 *
 * Token format: base64url(leadId.businessId).base64url(hmac)
 */

function getKey() {
  const k = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY;
  if (!k) throw new Error('JWT_SECRET or ENCRYPTION_KEY required for unsubscribe token signing');
  return k;
}

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input) {
  const s = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  return Buffer.from(s + pad, 'base64').toString('utf8');
}

export function makeUnsubscribeToken(leadId, businessId) {
  const payload = `${leadId}.${businessId}`;
  const sig = crypto.createHmac('sha256', getKey()).update(payload).digest();
  return `${b64url(payload)}.${b64url(sig)}`;
}

export function verifyUnsubscribeToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadPart, sigPart] = token.split('.');
  if (!payloadPart || !sigPart) return null;

  let payload;
  try {
    payload = b64urlDecode(payloadPart);
  } catch {
    return null;
  }

  const expected = crypto.createHmac('sha256', getKey()).update(payload).digest();
  let received;
  try {
    received = Buffer.from(sigPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  } catch {
    return null;
  }
  if (expected.length !== received.length) return null;
  if (!crypto.timingSafeEqual(expected, received)) return null;

  const [leadId, businessId] = payload.split('.');
  if (!leadId || !businessId) return null;
  return { leadId, businessId };
}
