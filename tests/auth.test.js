import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { REALTIME_EVENTS } from '../lib/realtime/constants.js';

describe('realtime constants', () => {
  it('defines chat events', () => {
    assert.ok(REALTIME_EVENTS.CHAT_MESSAGE);
    assert.ok(REALTIME_EVENTS.NOTIFICATION);
    assert.ok(REALTIME_EVENTS.CONNECTION);
  });
});

describe('billing plans', async () => {
  it('has four tiers', async () => {
    const { BILLING_PLANS, getBillingPlan } = await import('../lib/billing/plans.js');
    assert.equal(Object.keys(BILLING_PLANS).length, 4);
    assert.equal(getBillingPlan('pro').id, 'pro');
  });
});

describe('environment validation', async () => {
  it('provides dev JWT fallback when unset', async () => {
    const prev = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';

    const { requireEnv } = await import('../lib/env.js');
    const secret = requireEnv('JWT_SECRET');
    assert.ok(secret.includes('dev-only'));

    if (prev) process.env.JWT_SECRET = prev;
  });
});
