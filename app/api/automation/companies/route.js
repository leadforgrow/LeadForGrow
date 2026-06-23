import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Company from '@/models/automation/Company';
import Contact from '@/models/automation/Contact';
import Deal from '@/models/automation/Deal';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { parseListParams, buildSearchOr, paginationMeta } from '@/lib/crm/queryBuilder';
import { logTimelineEvent } from '@/lib/crm/timeline';
import { enrichCompaniesWithStats } from '@/lib/crm/companyService';

export const dynamic = 'force-dynamic';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, sortField, sortDir, search, archived } = parseListParams(searchParams);
    const industry = searchParams.get('industry');

    const query = { businessId: tenant.business._id, deletedAt: null, archived };
    if (industry) query.industry = industry;

    const searchOr = buildSearchOr(['name', 'domain', 'website', 'email'], search);
    if (searchOr) query.$or = searchOr;

    const [companies, total] = await Promise.all([
      Company.find(query)
        .populate('ownerId', 'firstName lastName email')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    const enriched = await enrichCompaniesWithStats(tenant.business._id, companies);

    return NextResponse.json({ success: true, data: enriched, pagination: paginationMeta(total, page, limit) });
  } catch (error) {
    console.error('[Companies API GET]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const body = await request.json();
    if (!body.name) return NextResponse.json({ success: false, error: 'Company name is required' }, { status: 400 });

    await dbConnect();

    const company = await Company.create({
      businessId: tenant.business._id,
      ...body,
      ownerId: body.ownerId || tenant.user._id,
      createdBy: tenant.user._id,
    });

    await logTimelineEvent({
      businessId: tenant.business._id,
      entityType: 'company',
      entityId: company._id,
      type: 'company_created',
      description: `Company "${company.name}" created`,
      performedBy: tenant.user._id,
    });

    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error) {
    console.error('[Companies API POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
