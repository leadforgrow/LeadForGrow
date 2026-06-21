import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rateLimit';
import { corsHeaders, upsertConsentLog } from '@/lib/consent/server';

export const POST = withRateLimit(20, 60, async function (request) {
  try {
    const body = await request.json();
    const {
      token,
      visitorId,
      status,
      analyticsAllowed,
      marketingAllowed,
      consentVersion,
      sourcePage,
      locale,
      regionHint,
      pageViews,
      notes,
    } = body;

    if (!token || !visitorId || !status) {
      return NextResponse.json(
        { success: false, error: 'token, visitorId, and status are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!['granted', 'denied', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid consent status' },
        { status: 400, headers: corsHeaders }
      );
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    const granted = status === 'granted';

    const result = await upsertConsentLog({
      token,
      visitorId,
      status,
      analyticsAllowed: granted ? analyticsAllowed !== false : false,
      marketingAllowed: granted ? marketingAllowed !== false : false,
      ipAddress,
      userAgent,
      sourcePage: sourcePage || request.headers.get('referer') || '',
      locale,
      regionHint,
      pageViews,
      notes: notes || `Consent ${status} via website banner (v${consentVersion || '1.0'})`,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Consent recorded',
        consent: {
          visitorId,
          status,
          analyticsAllowed: result.record.analyticsAllowed,
          marketingAllowed: result.record.marketingAllowed,
          recordedAt: result.record.updatedAt || result.record.createdAt,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Consent Log API]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record consent' },
      { status: 500, headers: corsHeaders }
    );
  }
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
