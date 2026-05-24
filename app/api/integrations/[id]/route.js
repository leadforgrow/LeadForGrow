import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import { getIntegrationDetail, updateIntegration } from '@/lib/integrations/service';

function getBaseUrl(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export const GET = withPlanAccess('integrations', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const baseUrl = getBaseUrl(req);
    const integration = await getIntegrationDetail(req.user.businessId, id, baseUrl);
    return NextResponse.json({ success: true, data: integration });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 404 });
  }
});

export const PUT = withPlanAccess('integrations', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const baseUrl = getBaseUrl(req);
    const integration = await updateIntegration(req.user.businessId, id, body, baseUrl);
    return NextResponse.json({ success: true, data: integration });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
});
