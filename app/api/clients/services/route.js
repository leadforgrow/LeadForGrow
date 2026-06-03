import { dbConnect } from '@/lib/mongodb';
import { CMS_Service } from '@/models/cms/ServiceTask';
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

    const services = await CMS_Service.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('[CMS_SERVICE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const body = await request.json();
    const { clientId, name, category } = body;
    const businessId = getTenantBusinessId(tenant);
    const userId = tenant.user._id;

    if (!clientId || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clientDenied = await assertClientInTenant(clientId, tenant);
    if (clientDenied) {
      return NextResponse.json({ success: false, error: clientDenied.error }, { status: clientDenied.status });
    }

    const service = await CMS_Service.create({ ...body, businessId, userId });

    await CMS_ActivityLog.create({
      clientId,
      businessId,
      type: 'Service Created',
      action: `Service "${name}" initiated`,
      userId,
      isVisibleToClient: true,
    });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    console.error('[CMS_SERVICE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
