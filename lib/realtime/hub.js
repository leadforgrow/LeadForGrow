/**
 * Realtime event hub — Redis pub/sub when available, in-process fallback.
 */
import { EventEmitter } from 'events';
import { REALTIME_EVENTS } from './constants';

export { REALTIME_EVENTS };

const CHANNEL_PREFIX = 'lfg:realtime:';
const localBus = new EventEmitter();
localBus.setMaxListeners(200);

let redisPub = null;
let redisSub = null;
let redisReady = false;

async function initRedis() {
  if (redisReady || !process.env.REDIS_URL) return;
  try {
    const IORedis = (await import('ioredis')).default;
    redisPub = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 });
    redisSub = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 });

    redisSub.on('message', (channel, message) => {
      const businessId = channel.replace(CHANNEL_PREFIX, '');
      try {
        localBus.emit(businessId, JSON.parse(message));
      } catch {
        /* ignore malformed */
      }
    });

    redisReady = true;
  } catch (err) {
    console.warn('[Realtime] Redis unavailable, using in-process events:', err.message);
  }
}

initRedis();

export async function publishEvent(businessId, event) {
  const payload = { ...event, ts: Date.now() };
  const serialized = JSON.stringify(payload);

  localBus.emit(String(businessId), payload);

  if (redisPub) {
    try {
      await redisPub.publish(`${CHANNEL_PREFIX}${businessId}`, serialized);
    } catch (err) {
      console.warn('[Realtime] Redis publish failed:', err.message);
    }
  }
}

export function subscribe(businessId, handler) {
  const key = String(businessId);
  localBus.on(key, handler);
  return () => localBus.off(key, handler);
}
