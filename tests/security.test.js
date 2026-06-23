import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import {
  generateTokenPair,
  verifyRefreshToken,
  hashToken,
} from '../lib/security/refreshToken.js';
import { verifyMetaSignature, computeMetaSignature } from '../lib/webhookSecurity.js';

process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';

describe('refresh tokens', () => {
  const user = {
    _id: '507f1f77bcf86cd799439011',
    businessId: '507f1f77bcf86cd799439012',
    role: 'owner',
  };

  it('generates access + refresh pair', () => {
    const { accessToken, refreshToken } = generateTokenPair(user);
    assert.ok(accessToken);
    assert.ok(refreshToken);
    assert.notEqual(accessToken, refreshToken);
  });

  it('verifies valid refresh token', () => {
    const { refreshToken } = generateTokenPair(user);
    const decoded = verifyRefreshToken(refreshToken);
    assert.equal(decoded.userId, user._id);
    assert.equal(decoded.type, 'refresh');
  });

  it('rejects access token as refresh', () => {
    const { accessToken } = generateTokenPair(user);
    assert.equal(verifyRefreshToken(accessToken), null);
  });

  it('hashes tokens consistently', () => {
    assert.equal(hashToken('abc'), hashToken('abc'));
    assert.notEqual(hashToken('abc'), hashToken('def'));
  });
});

describe('webhook security', () => {
  it('verifies Meta HMAC signature', () => {
    const secret = 'test-app-secret';
    const payload = '{"entry":[]}';
    const sig = computeMetaSignature(payload, secret);
    assert.equal(verifyMetaSignature(payload, sig, secret), true);
    assert.equal(verifyMetaSignature(payload, 'sha256=invalid', secret), false);
  });
});

describe('legacy auth rejection', async () => {
  it('rejectLegacyAuth blocks x-user-id', async () => {
    const { rejectLegacyAuth } = await import('../lib/auth.js');
    const req = {
      headers: { get: (h) => (h === 'x-user-id' ? 'fake-id' : null) },
      url: 'http://localhost/api/test',
    };
    const res = rejectLegacyAuth(req);
    assert.ok(res);
    assert.equal(res.status, 401);
  });
});
