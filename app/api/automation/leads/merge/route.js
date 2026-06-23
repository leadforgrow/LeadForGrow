import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { mergeLeads } from '@/lib/crm/merge';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const { sourceId, targetId } = await request.json();
    if (!sourceId || !targetId) {
      return NextResponse.json({ success: false, error: 'sourceId and targetId required' }, { status: 400 });
    }

    const result = await mergeLeads(tenant.business._id, sourceId, targetId, tenant.user._id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Leads Merge]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
