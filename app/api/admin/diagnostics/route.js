import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { checkDBHealth } from '@/lib/mongodb';
import IORedis from 'ioredis';

export const GET = withAuth()(async (req) => {
  const role = (req.user.role || '').toLowerCase();
  if (!['super_admin', 'owner', 'super'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    services: {},
  };

  diagnostics.services.mongodb = await checkDBHealth();

  if (process.env.REDIS_URL) {
    try {
      const redis = new IORedis(process.env.REDIS_URL, { connectTimeout: 2000, maxRetriesPerRequest: 1 });
      await redis.ping();
      diagnostics.services.redis = { status: 'healthy' };
      await redis.quit();
    } catch (e) {
      diagnostics.services.redis = { status: 'unhealthy', message: e.message };
    }
  } else {
    diagnostics.services.redis = { status: 'not_configured' };
  }

  diagnostics.services.worker = {
    isWorker: process.env.IS_WORKER === 'true',
    redisConfigured: !!process.env.REDIS_URL,
  };

  diagnostics.services.billing = {
    stripe: !!process.env.STRIPE_SECRET_KEY,
    razorpay: !!process.env.RAZORPAY_KEY_ID,
  };

  const unhealthy = Object.values(diagnostics.services).some((s) => s.status === 'unhealthy');

  return NextResponse.json(diagnostics, { status: unhealthy ? 503 : 200 });
});
