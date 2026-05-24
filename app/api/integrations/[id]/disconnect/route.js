import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import { disconnectIntegration } from '@/lib/integrations/service';

function getBaseUrl(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export const POST = withPlanAccess('integrations', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const baseUrl = getBaseUrl(req);
    const integration = await disconnectIntegration(req.user.businessId, id, baseUrl);
    return NextResponse.json({ success: true, data: integration });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
});
