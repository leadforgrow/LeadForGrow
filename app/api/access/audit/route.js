import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import AccessAuditLog from '@/models/access/AccessAuditLog';
import { resolveUserAccess } from '@/lib/access/resolver';

export const GET = withTenantAuth(async (req) => {
  try {
    await dbConnect();
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const access = await resolveUserAccess({
      userId: tenant.user._id,
      businessId: tenant.business._id,
      business: tenant.business,
      user: tenant.user,
    });

    if (!access.tierFeatures.audit_logs && !access.isOwner) {
      return NextResponse.json(
        { success: false, error: 'Audit logs require Growth plan or higher.', requiresUpgrade: true },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const logs = await AccessAuditLog.find({ businessId: tenant.business._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load audit logs' }, { status: 500 });
  }
});
