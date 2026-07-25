import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import Message from '@/models/automation/Message';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { logTimelineEvent } from '@/lib/crm/timeline';
import { normalizeLeadStatus } from '@/lib/crm/leadStages';

const MAX_BATCH = 500;

export const PATCH = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const body = await request.json();
    const { ids, action, data } = body;

    if (!Array.isArray(ids) || !ids.length || !action) {
      return NextResponse.json({ success: false, error: 'ids array and action required' }, { status: 400 });
    }
    if (ids.length > MAX_BATCH) {
      return NextResponse.json(
        { success: false, error: `Bulk operations are limited to ${MAX_BATCH} leads at a time` },
        { status: 400 }
      );
    }

    await dbConnect();
    const query = { _id: { $in: ids }, businessId: tenant.business._id };
    let modified = 0;

    switch (action) {
      case 'archive': {
        const res = await Lead.updateMany(query, { archived: true, archivedAt: new Date(), updatedBy: tenant.user._id });
        modified = res.modifiedCount;
        break;
      }
      case 'restore': {
        const res = await Lead.updateMany(query, { archived: false, archivedAt: null, updatedBy: tenant.user._id });
        modified = res.modifiedCount;
        break;
      }
      case 'assign': {
        if (!data?.assignedTo) return NextResponse.json({ success: false, error: 'assignedTo required' }, { status: 400 });
        const res = await Lead.updateMany(query, { assignedTo: data.assignedTo, updatedBy: tenant.user._id });
        modified = res.modifiedCount;
        break;
      }
      case 'status': {
        if (!data?.status) return NextResponse.json({ success: false, error: 'status required' }, { status: 400 });
        const normalized = normalizeLeadStatus(data.status);
        // Conversion creates contacts/deals — it must go through the convert flow, not a bulk flag flip
        if (normalized === 'converted' || normalized === 'won') {
          return NextResponse.json(
            { success: false, error: 'Use the convert action to mark leads as converted/won', code: 'USE_CONVERT_FLOW' },
            { status: 400 }
          );
        }
        const updates = { status: normalized, updatedBy: tenant.user._id };
        if (normalized === 'lost') updates.lostAt = new Date();
        const res = await Lead.updateMany({ ...query, status: { $ne: 'converted' } }, updates);
        modified = res.modifiedCount;
        break;
      }
      case 'tags': {
        if (!data?.tags) return NextResponse.json({ success: false, error: 'tags required' }, { status: 400 });
        const res = await Lead.updateMany(query, {
          $addToSet: { tags: { $each: data.tags } },
          $set: { updatedBy: tenant.user._id },
        });
        modified = res.modifiedCount;
        break;
      }
      case 'delete': {
        // Same cascade as single-lead delete (Activity, Task, Message)
        const [res] = await Promise.all([
          Lead.deleteMany(query),
          Activity.deleteMany({ leadId: { $in: ids }, businessId: tenant.business._id }),
          Task.deleteMany({ leadId: { $in: ids }, businessId: tenant.business._id }),
          Message.deleteMany({ leadId: { $in: ids }, businessId: tenant.business._id }),
        ]);
        modified = res.deletedCount;
        break;
      }
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

    return NextResponse.json({ success: true, data: { modified, requested: ids.length } });
  } catch (error) {
    console.error('[Leads Bulk]', error);
    return NextResponse.json({ success: false, error: 'Bulk operation failed' }, { status: 500 });
  }
});
