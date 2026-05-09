import IORedis from 'ioredis';
import { NextResponse } from 'next/server';

const REDIS_URL = process.env.REDIS_URL;
const redis = REDIS_URL ? new IORedis(REDIS_URL) : null;

if (redis) {
    redis.on('error', (err) => {
        console.error('[RateLimit] Redis connection error:', err.message);
    });
}

/**
 * Redis-based Rate Limiter
 * @param {string} id - Unique identifier (e.g., IP or user ID)
 * @param {number} limit - Max requests
 * @param {number} window - Time window in seconds
 * @returns {Promise<{success: boolean, current: number, limit: number, remaining: number}>}
 */
export async function rateLimit(id, limit, window) {
    if (!redis) {
        return { success: true, current: 0, limit, remaining: limit };
    }

    const key = `rate_limit:${id}`;

    try {
        const multi = redis.multi();
        multi.incr(key);
        multi.expire(key, window);

        const [incrResult] = await multi.exec();
        const currentCount = incrResult[1];

        return {
            success: currentCount <= limit,
            current: currentCount,
            limit,
            remaining: Math.max(0, limit - currentCount)
        };
    } catch (error) {
        console.error('[RateLimit] Redis error:', error.message);
        // Fail open in case of Redis error to avoid blocking legitimate users
        return { success: true, current: 0, limit, remaining: limit };
    }
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(limit, window, handler) {
    return async (req, ...args) => {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

        const { success, remaining } = await rateLimit(ip, limit, window);

        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'Too many requests. Please try again later.'
            }, {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': '0'
                }
            });
        }

        const response = await handler(req, ...args);

        // Add rate limit headers to response
        if (response instanceof NextResponse) {
            response.headers.set('X-RateLimit-Limit', limit.toString());
            response.headers.set('X-RateLimit-Remaining', remaining.toString());
        }

        return response;
    };
}
