import { dbConnect } from '@/lib/mongodb';
import CMS_Invoice from '@/models/cms/Invoice';
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

    const invoices = await CMS_Invoice.find(query).sort({ dueDate: -1 });

    const stats = {
      totalRevenue: invoices.reduce((sum, inv) => (inv.status === 'Paid' ? sum + inv.amount : sum), 0),
      pendingRevenue: invoices.reduce((sum, inv) => (inv.status === 'Pending' ? sum + inv.amount : sum), 0),
      overdueRevenue: invoices.reduce((sum, inv) => (inv.status === 'Overdue' ? sum + inv.amount : sum), 0),
    };

    return NextResponse.json({ success: true, data: invoices, stats });
  } catch (error) {
    console.error('[CMS_BILLING_GET]', error);
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

    if (!body.clientId || !body.invoiceNumber || !body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const clientDenied = await assertClientInTenant(body.clientId, tenant);
    if (clientDenied) {
      return NextResponse.json({ success: false, error: clientDenied.error }, { status: clientDenied.status });
    }

    const invoice = await CMS_Invoice.create({ ...body, businessId });
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('[CMS_BILLING_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
