import { dbConnect } from '@/lib/mongodb';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import {
  assertClientInTenant,
  assertTenantBusinessId,
  getTenantBusinessId,
} from '@/lib/cms/assertTenantBusiness';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const businessId = searchParams.get('businessId') || getTenantBusinessId(tenant);

    const denied = assertTenantBusinessId(tenant, businessId);
    if (denied) {
      return NextResponse.json({ success: false, error: denied.error }, { status: denied.status });
    }

    const clientDenied = await assertClientInTenant(clientId, tenant);
    if (clientDenied) {
      return NextResponse.json({ success: false, error: clientDenied.error }, { status: clientDenied.status });
    }

    const query = { businessId };
    if (clientId) query.clientId = clientId;

    const logs = await CMS_ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName group');

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('[CMS_ACTIVITY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
