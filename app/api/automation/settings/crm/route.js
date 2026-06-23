import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';
import { getCrmSettings, PAYMENT_ON_CONFIRM_MODES, LOST_REASONS } from '@/lib/crm/crmSettings';

export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const business = await Business.findById(req.user.businessId).lean();
    if (!business) return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    return NextResponse.json({
      success: true,
      data: {
        ...getCrmSettings(business),
        lostReasons: LOST_REASONS,
        paymentModes: PAYMENT_ON_CONFIRM_MODES,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const body = await req.json();
    const business = await Business.findById(req.user.businessId);
    if (!business) return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });

    business.settings = business.settings || {};
    business.settings.crm = { ...(business.settings.crm || {}), ...body };
    await business.save();

    return NextResponse.json({ success: true, data: getCrmSettings(business) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
