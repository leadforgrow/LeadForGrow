import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { mergeContacts } from '@/lib/crm/merge';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const { sourceId, targetId } = await request.json();
    if (!sourceId || !targetId) {
      return NextResponse.json({ success: false, error: 'sourceId and targetId required' }, { status: 400 });
    }

    await dbConnect();
    const result = await mergeContacts(tenant.business._id, sourceId, targetId, tenant.user._id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Contacts Merge]', error);
    const status = error.status || 500;
    const message = status === 500 ? 'Failed to merge contacts' : error.message;
    return NextResponse.json({ success: false, error: message }, { status });
  }
});
