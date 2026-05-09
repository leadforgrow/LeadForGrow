import crypto from 'crypto';

/**
 * Validates the X-Hub-Signature-256 header from Meta
 * @param {string} payload - The raw request body as a string
 * @param {string} signature - The X-Hub-Signature-256 header value
 * @param {string} appSecret - Your Meta App Secret
 * @returns {boolean}
 */
export function validateMetaSignature(payload, signature, appSecret) {
  if (!signature || !appSecret) return false;

  const [algo, sig] = signature.split('=');
  if (algo !== 'sha256') return false;

  const hmac = crypto.createHmac('sha256', appSecret);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
}
