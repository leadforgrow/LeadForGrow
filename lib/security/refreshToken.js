import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { requireEnv } from '../env.js';

const REFRESH_EXPIRES_IN = '30d';
const ACCESS_EXPIRES_IN = '7d';

function getRefreshSecret() {
  return process.env.REFRESH_TOKEN_SECRET || requireEnv('JWT_SECRET');
}

/**
 * Generate short-lived access token + long-lived refresh token pair.
 */
export function generateTokenPair(user, options = {}) {
  const payload = {
    userId: user._id?.toString?.() || user._id,
    businessId: user.businessId?.toString?.() || user.businessId,
    agencyId: user.agencyId?.toString?.() || user.agencyId || null,
    role: user.role,
    plan: options.plan || user.plan || 'free',
    type: 'access',
  };

  const accessToken = jwt.sign(payload, requireEnv('JWT_SECRET'), {
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshPayload = {
    ...payload,
    type: 'refresh',
    jti: crypto.randomUUID(),
  };

  const refreshToken = jwt.sign(refreshPayload, getRefreshSecret(), {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken, expiresIn: ACCESS_EXPIRES_IN };
}

/**
 * Verify refresh token and return decoded payload.
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, getRefreshSecret());
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Hash refresh token for storage (if persisting server-side).
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN };
