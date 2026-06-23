import { withApiHandler } from '@/lib/api/handler';
import { apiSuccess } from '@/lib/api/response';
import { checkDBHealth } from '@/lib/mongodb';
import IORedis from 'ioredis';

export const dynamic = 'force-dynamic';

async function checkRedis() {
  if (!process.env.REDIS_URL) {
    return { status: 'not_configured', message: 'REDIS_URL not set' };
  }
  try {
    const redis = new IORedis(process.env.REDIS_URL, {
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    await redis.connect();
    await redis.ping();
    await redis.quit();
    return { status: 'healthy' };
  } catch (e) {
    return { status: 'unhealthy', message: e.message };
  }
}

export const GET = withApiHandler(async (req) => {
  const [mongodb, redis] = await Promise.all([checkDBHealth(), checkRedis()]);

  const services = { mongodb, redis };
  const unhealthy = Object.values(services).some((s) => s.status === 'unhealthy');

  return apiSuccess(
    {
      status: unhealthy ? 'degraded' : 'healthy',
      version: process.env.npm_package_version || '0.1.0',
      uptime: process.uptime(),
      services,
    },
    {},
    unhealthy ? 503 : 200,
    req.requestId
  );
}, { logRequest: false });
