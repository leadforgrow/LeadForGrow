import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { ApiError } from '../api/errors.js';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Issue a CSRF token cookie + return token value for client.
 */
export function createCsrfToken() {
  return generateToken();
}

export function setCsrfCookie(response, token) {
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}

/**
 * Validate CSRF for cookie-authenticated state-changing requests.
 * Skipped when Authorization Bearer header is present (API clients).
 */
export function validateCsrf(req) {
  if (SAFE_METHODS.has(req.method)) return;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return;

  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const cookieToken = cookies[CSRF_COOKIE];
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw ApiError.forbidden('CSRF validation failed');
  }
}

/**
 * Middleware wrapper for CSRF-protected routes.
 */
export function withCsrf(handler) {
  return async (req, ...args) => {
    validateCsrf(req);
    return handler(req, ...args);
  };
}

export { CSRF_HEADER, CSRF_COOKIE };
