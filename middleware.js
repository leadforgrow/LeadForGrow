import { NextResponse } from 'next/server';

/** Public API routes — no JWT required */
const PUBLIC_API_PREFIXES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/forms/submit',
  '/api/forms/public',
  '/api/forms/config',
  '/api/consent/log',
  '/api/consent/track',
  '/api/meetings/public',
  '/api/meetings/book',
  '/api/webhooks/',
  '/api/public/',
  '/api/cron/',
];

/** Protected API prefixes — JWT required */
const PROTECTED_API_PREFIXES = [
  '/api/automation/',
  '/api/agency/',
  '/api/integrations/',
  '/api/business/',
  '/api/billing/',
  '/api/admin/',
  '/api/onboarding/',
  '/api/forms',
  '/api/ai/',
  '/api/clients/',
  '/api/websites',
  '/api/upload',
  '/api/cloudinary-sign',
  '/api/auth/me',
  '/api/realtime/',
  '/api/access/',
];

const PROTECTED_PAGE_PREFIXES = ['/automation', '/agency', '/lfgadmin'];

function isPublicApi(pathname) {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

function isProtectedApi(pathname) {
  if (isPublicApi(pathname)) return false;
  return PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
}

function isProtectedPage(pathname) {
  return PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
}

function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  const cookieToken =
    request.cookies.get('token')?.value || request.cookies.get('userToken')?.value;
  if (cookieToken) return cookieToken;

  // EventSource cannot send Authorization headers
  const queryToken = request.nextUrl.searchParams.get('token');
  if (queryToken) return queryToken;

  return null;
}

function hasValidTokenFormat(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    if (request.headers.get('x-user-id')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Legacy x-user-id authentication is no longer supported.',
          code: 'LEGACY_AUTH_REJECTED',
        },
        { status: 401 }
      );
    }

    if (process.env.NODE_ENV === 'production') {
      const blocked = [
        '/api/debug-test',
        '/api/debug/',
        '/api/pupp',
        '/api/scrape',
        '/api/rag-test',
      ];
      if (blocked.some((b) => pathname.startsWith(b))) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
    }
  }

  if (isProtectedApi(pathname) || isProtectedPage(pathname)) {
    const token = extractToken(request);
    if (!hasValidTokenFormat(token)) {
      if (isProtectedPage(pathname)) {
        const loginUrl = new URL('/user/register?mode=login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/automation/:path*', '/agency/:path*', '/lfgadmin/:path*'],
};
