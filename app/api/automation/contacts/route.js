import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Contact from '@/models/automation/Contact';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { parseListParams, buildSearchOr, paginationMeta } from '@/lib/crm/queryBuilder';
import { logTimelineEvent } from '@/lib/crm/timeline';
import { findDuplicateContacts } from '@/lib/crm/duplicateDetection';

export const dynamic = 'force-dynamic';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, sortField, sortDir, search, archived } = parseListParams(searchParams);
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');

    const query = { businessId: tenant.business._id, deletedAt: null, archived };
    if (companyId) query.companyId = companyId;
    if (type) query.type = type;
    if (tag) query.tags = tag;

    const searchOr = buildSearchOr(['fullName', 'firstName', 'lastName', 'jobTitle'], search);
    if (searchOr) query.$or = searchOr;

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate('companyId', 'name domain')
        .populate('ownerId', 'firstName lastName email')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, data: contacts, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    console.error('[Contacts API GET]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const body = await request.json();
    if (!body.firstName) return NextResponse.json({ success: false, error: 'First name is required' }, { status: 400 });

    await dbConnect();

    const duplicates = await findDuplicateContacts(tenant.business._id, {
      phones: (body.phones || []).map((p) => p.number),
      emails: (body.emails || []).map((e) => e.address),
    });

    const contact = await Contact.create({
      businessId: tenant.business._id,
      ...body,
      ownerId: body.ownerId || tenant.user._id,
      createdBy: tenant.user._id,
    });

    await logTimelineEvent({
      businessId: tenant.business._id,
      entityType: 'contact',
      entityId: contact._id,
      type: 'contact_created',
      description: `Contact "${contact.fullName}" created`,
      performedBy: tenant.user._id,
    });

    if (body.companyId) {
      await logTimelineEvent({
        businessId: tenant.business._id,
        entityType: 'company',
        entityId: body.companyId,
        type: 'company_updated',
        description: `Contact "${contact.fullName}" linked to company`,
        performedBy: tenant.user._id,
        metadata: { contactId: contact._id },
      });
    }

    return NextResponse.json({ success: true, data: contact, duplicates }, { status: 201 });
  } catch (error) {
    console.error('[Contacts API POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
