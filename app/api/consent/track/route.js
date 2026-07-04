import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rateLimit';
import { appendPageView, corsHeaders } from '@/lib/consent/server';

async function parseRequestBody(request) {
  const text = await request.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const POST = withRateLimit(60, 60, async function (request) {
  try {
    const body = await parseRequestBody(request);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { token, visitorId, path, title, durationSec } = body;

    if (!token || !visitorId || !path) {
      return NextResponse.json(
        { success: false, error: 'token, visitorId, and path are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const result = await appendPageView({
      token,
      visitorId,
      path,
      title,
      durationSec,
      ipAddress,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 400, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('[Consent Track API]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track page view' },
      { status: 500, headers: corsHeaders }
    );
  }
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
