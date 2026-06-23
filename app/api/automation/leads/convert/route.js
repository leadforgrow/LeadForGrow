import { NextResponse } from 'next/server';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { convertLead } from '@/lib/crm/conversion';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });

    const body = await request.json();
    if (!body.leadId) return NextResponse.json({ success: false, error: 'leadId required' }, { status: 400 });

    const result = await convertLead(tenant.business._id, body.leadId, tenant.user._id, {
      createDeal: body.createDeal !== false,
      dealTitle: body.dealTitle,
      dealAmount: body.dealAmount,
      currency: body.currency,
      dealStage: body.dealStage,
      pipelineId: body.pipelineId,
      companyId: body.companyId,
      companyName: body.companyName,
      expectedCloseDate: body.expectedCloseDate,
      assignedTo: body.assignedTo,
      linkExistingContact: body.linkExistingContact,
    });

    return NextResponse.json({
      success: true,
      data: {
        leadId: result.lead?._id,
        contactId: result.contact?._id,
        companyId: result.company?._id,
        dealId: result.deal?._id,
        lead: result.lead,
        contact: result.contact,
        company: result.company,
        deal: result.deal,
        pipeline: result.pipeline,
      },
    });
  } catch (error) {
    console.error('[Leads Convert]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
