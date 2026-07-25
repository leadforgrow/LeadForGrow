import { NextResponse } from 'next/server';
import { getGoogleAuthUrl, getGoogleClientId, getGoogleClientSecret } from '@/lib/auth/googleOAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/google?mode=login|register&isAgency=0|1
 * Redirects to Google OAuth consent screen.
 */
export async function GET(req) {
  try {
    if (!getGoogleClientId() || !getGoogleClientSecret()) {
      return NextResponse.json(
        { success: false, error: 'Google Sign-In is not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    const isAgency = searchParams.get('isAgency') === '1' ? '1' : '0';

    // Random nonce bound to the browser via httpOnly cookie (login CSRF protection)
    const nonce = globalThis.crypto.randomUUID();
    const state = `${mode}:${isAgency}:${nonce}`;

    const url = getGoogleAuthUrl(state);
    const res = NextResponse.redirect(url);
    res.cookies.set('g_oauth_state', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    return res;
  } catch (error) {
    console.error('[Google OAuth] start error:', error);
    const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    return NextResponse.redirect(`${base}/login?error=google_config`);
  }
}
