import crypto from 'crypto';

/**
 * Verify Meta Cloud API Webhook Signature
 * @param {string|Buffer} payload - Raw request body
 * @param {string} signature - X-Hub-Signature-256 header value
 * @param {string} appSecret - Meta App Secret
 * @returns {boolean} - True if signature is valid
 */
export function verifyMetaSignature(payload, signature, appSecret) {
    if (!signature || !appSecret) return false;

    try {
        const [algo, hash] = signature.split('=');
        if (algo !== 'sha256') return false;

        const expectedHash = crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex');

        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
    } catch (error) {
        console.error('[Security] Meta signature verification failed:', error.message);
        return false;
    }
}

/**
 * Optional token validation for Interakt
 * @param {string} receivedToken - Token from request
 * @param {string} expectedToken - Token from env/config
 * @returns {boolean}
 */
export function verifyInteraktToken(receivedToken, expectedToken) {
    if (!expectedToken) return true; // Optional layer
    return receivedToken === expectedToken;
}
