import { NextResponse } from 'next/server';
import { apiError } from './response.js';
import { getRequestId } from './requestId.js';
import { ApiError } from './errors.js';
import { logger } from '../logger.js';

/**
 * Standard API route wrapper: request ID, error handling, logging.
 * Composable with withAuth / withRateLimit / withTenantAuth.
 *
 * @example
 * export const GET = withApiHandler(async (req, ctx) => {
 *   return apiSuccess({ ok: true }, {}, 200, req.requestId);
 * });
 */
export function withApiHandler(handler, options = {}) {
  const { logRequest = true } = options;

  return async (req, ...args) => {
    const requestId = getRequestId(req);
    req.requestId = requestId;
    const start = Date.now();
    const path = new URL(req.url).pathname;

    try {
      const result = await handler(req, ...args);

      if (logRequest) {
        logger.info('api_request', {
          requestId,
          method: req.method,
          path,
          durationMs: Date.now() - start,
        });
      }

      if (result instanceof NextResponse || result instanceof Response) {
        result.headers.set('x-request-id', requestId);
        return result;
      }

      return NextResponse.json(
        { success: true, data: result, requestId },
        { headers: { 'x-request-id': requestId } }
      );
    } catch (error) {
      logger.warn('api_error', {
        requestId,
        method: req.method,
        path,
        code: error instanceof ApiError ? error.code : 'INTERNAL_ERROR',
        message: error.message,
        durationMs: Date.now() - start,
      });
      return apiError(error, requestId);
    }
  };
}

/**
 * Verify cron secret for scheduled job routes.
 */
export function verifyCronSecret(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError('CRON_SECRET not configured', 503, 'CRON_NOT_CONFIGURED');
    }
    return;
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${secret}`) {
    throw ApiError.unauthorized('Invalid cron secret');
  }
}
