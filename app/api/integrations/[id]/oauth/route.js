import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import { simulateOAuthConnect } from '@/lib/integrations/service';

function getBaseUrl(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

/**
 * OAuth connect stub — stores tokens after provider redirect.
 * Full OAuth redirect flow can be wired to Google/Microsoft later.
 */
export const POST = withPlanAccess('integrations', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const baseUrl = getBaseUrl(req);

    const integration = await simulateOAuthConnect(
      req.user.businessId,
      id,
      {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        expiresAt: body.expiresAt,
        scopes: body.scopes,
        connectedEmail: body.connectedEmail,
        accountName: body.accountName
      },
      req.user.userId,
      baseUrl
    );

    return NextResponse.json({ success: true, data: integration });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
});
