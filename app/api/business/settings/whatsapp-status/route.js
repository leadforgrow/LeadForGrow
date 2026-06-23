import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import AutomationRule from '@/models/automation/AutomationRule';
import { withPlanAccess } from '@/lib/accessControl';

export const GET = withPlanAccess('settings', async (req) => {
  try {
    await dbConnect();
    const business = await Business.findById(req.user.businessId);
    if (!business) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const wa = business.integrationCredentials?.whatsapp || {};
    const templateCount = await AutomationRule.countDocuments({
      businessId: business._id,
      type: 'manual_template',
      'config.isMetaTemplate': true,
    });

    return NextResponse.json({
      success: true,
      data: {
        businessName: business.businessName,
        whatsapp: {
          enabled: wa.enabled || false,
          provider: wa.provider || 'meta',
          phoneNumberId: wa.phoneNumberId,
          businessAccountId: wa.businessAccountId,
          displayNumber: wa.displayNumber || wa.phoneNumberId,
          businessName: business.businessName,
          qualityRating: wa.qualityRating || 'Unknown',
          verificationStatus: wa.enabled ? 'Verified' : 'Not connected',
          webhookStatus: wa.enabled ? 'active' : 'inactive',
          templateCount,
          lastVerified: wa.lastVerified,
        },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
