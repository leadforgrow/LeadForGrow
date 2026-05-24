import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import { connectIntegration } from '@/lib/integrations/service';

function getBaseUrl(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export const POST = withPlanAccess('integrations', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const baseUrl = getBaseUrl(req);

    const result = await connectIntegration(
      req.user.businessId,
      id,
      { credentials: body.credentials || {}, config: body.config || {}, testOnConnect: body.testOnConnect !== false },
      req.user.userId,
      baseUrl
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
});
