import { dbConnect } from '@/lib/mongodb';
import CMS_Client from '@/models/cms/Client';
import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { assertTenantBusinessId, getTenantBusinessId } from '@/lib/cms/assertTenantBusiness';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId') || getTenantBusinessId(tenant);
    const denied = assertTenantBusinessId(tenant, businessId);
    if (denied) {
      return NextResponse.json({ success: false, error: denied.error }, { status: denied.status });
    }

    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query = { businessId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'primaryContact.name': { $regex: search, $options: 'i' } },
        { 'primaryContact.email': { $regex: search, $options: 'i' } },
      ];
    }

    const [serviceCount, taskCount, clients] = await Promise.all([
      import('@/models/cms/ServiceTask').then((m) =>
        m.CMS_Service.countDocuments({ businessId, status: 'In Progress' })
      ),
      import('@/models/cms/ServiceTask').then((m) =>
        m.CMS_Task.countDocuments({
          businessId,
          status: { $ne: 'Completed' },
          dueDate: { $lte: new Date(new Date().setHours(23, 59, 59, 999)) },
        })
      ),
      CMS_Client.find(query).sort({ createdAt: -1 }).populate('accountManager', 'firstName lastName email'),
    ]);

    return NextResponse.json({
      success: true,
      data: clients,
      meta: { serviceCount, taskCount },
    });
  } catch (error) {
    console.error('[CMS_CLIENT_GET]', error);
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
    const businessId = getTenantBusinessId(tenant);

    if (!body.companyName || !body.primaryContact?.name || !body.primaryContact?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await CMS_Client.create({ ...body, businessId });

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    console.error('[CMS_CLIENT_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
});
