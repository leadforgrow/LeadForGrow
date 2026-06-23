import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { logTimelineEvent } from '@/lib/crm/timeline';

export const PATCH = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const body = await request.json();
    const { ids, action, data } = body;

    if (!Array.isArray(ids) || !ids.length || !action) {
      return NextResponse.json({ success: false, error: 'ids array and action required' }, { status: 400 });
    }

    await dbConnect();
    const query = { _id: { $in: ids }, businessId: tenant.business._id };
    let modified = 0;

    switch (action) {
      case 'archive':
        await Lead.updateMany(query, { archived: true, archivedAt: new Date(), updatedBy: tenant.user._id });
        modified = ids.length;
        break;
      case 'restore':
        await Lead.updateMany(query, { archived: false, archivedAt: null, updatedBy: tenant.user._id });
        modified = ids.length;
        break;
      case 'assign':
        if (!data?.assignedTo) return NextResponse.json({ success: false, error: 'assignedTo required' }, { status: 400 });
        await Lead.updateMany(query, { assignedTo: data.assignedTo, updatedBy: tenant.user._id });
        modified = ids.length;
        break;
      case 'status':
        if (!data?.status) return NextResponse.json({ success: false, error: 'status required' }, { status: 400 });
        await Lead.updateMany(query, { status: data.status, updatedBy: tenant.user._id });
        modified = ids.length;
        break;
      case 'tags':
        if (!data?.tags) return NextResponse.json({ success: false, error: 'tags required' }, { status: 400 });
        for (const leadId of ids) {
          await Lead.findByIdAndUpdate(leadId, { $addToSet: { tags: { $each: data.tags } }, updatedBy: tenant.user._id });
        }
        modified = ids.length;
        break;
      case 'delete':
        await Promise.all([
          Lead.deleteMany(query),
          Activity.deleteMany({ leadId: { $in: ids }, businessId: tenant.business._id }),
        ]);
        modified = ids.length;
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (action !== 'delete') {
      await logTimelineEvent({
        businessId: tenant.business._id,
        entityType: 'lead',
        entityId: ids[0],
        leadId: ids[0],
        type: action === 'archive' ? 'lead_archived' : 'lead_updated',
        description: `Bulk ${action} on ${modified} leads`,
        performedBy: tenant.user._id,
        metadata: { ids, action, data },
      });
    }

    return NextResponse.json({ success: true, data: { modified } });
  } catch (error) {
    console.error('[Leads Bulk]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
