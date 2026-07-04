import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Contact from '@/models/automation/Contact';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const { ids, action, data } = await request.json();
    if (!Array.isArray(ids) || !ids.length || !action) {
      return NextResponse.json({ success: false, error: 'ids and action required' }, { status: 400 });
    }

    await dbConnect();
    const query = { _id: { $in: ids }, businessId: tenant.business._id, deletedAt: null };

    switch (action) {
      case 'delete':
        await Contact.updateMany(query, { deletedAt: new Date(), updatedBy: tenant.user._id });
        break;
      case 'archive':
        await Contact.updateMany(query, { archived: true, updatedBy: tenant.user._id });
        break;
      case 'assignOwner':
        if (!data?.ownerId) return NextResponse.json({ success: false, error: 'ownerId required' }, { status: 400 });
        await Contact.updateMany(query, { ownerId: data.ownerId, updatedBy: tenant.user._id });
        break;
      case 'addTags':
        if (!data?.tags?.length) return NextResponse.json({ success: false, error: 'tags required' }, { status: 400 });
        await Contact.updateMany(query, { $addToSet: { tags: { $each: data.tags } }, updatedBy: tenant.user._id });
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
