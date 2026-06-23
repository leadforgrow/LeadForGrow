import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Activity from '@/models/automation/Activity';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const query = { businessId: tenant.business._id };
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const leadId = searchParams.get('leadId');

    if (entityType && entityId) {
      query.entityType = entityType;
      query.entityId = entityId;
    } else if (leadId) {
      query.leadId = leadId;
    }

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('leadId', 'name phone serviceInterest')
        .populate('performedBy', 'firstName lastName')
        .sort({ performedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch activities' }, { status: 500 });
  }
});
