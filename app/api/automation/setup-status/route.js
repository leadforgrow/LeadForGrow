import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import LeadSource from '@/models/automation/LeadSource';
import AutomationRule from '@/models/automation/AutomationRule';
import TeamMember from '@/models/automation/TeamMember';
import Business from '@/models/Business';
import Form from '@/models/Form';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const GET = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const { business } = tenant;
    const businessId = business._id;

    const formsCount = await Form.countDocuments({ businessId });
    const leadSourcesCount = await LeadSource.countDocuments({
      businessId,
      status: { $in: ['Connected', 'Active'] },
    });
    const hasLeadSource = formsCount > 0 || leadSourcesCount > 0;

    const activeRules = await AutomationRule.find({
      businessId,
      enabled: true,
      type: { $in: ['instant_acknowledgement', 'notify_team', 'follow_up_reminder'] },
    });
    const hasAutomation = activeRules.length >= 2;

    const teamMembers = await TeamMember.find({ businessId });
    const hasTeamSetup = teamMembers.length > 0 || business.plan !== 'free';
    const onboardingComplete = business.onboardingComplete || (hasLeadSource && hasAutomation);

    return NextResponse.json({
      success: true,
      data: { hasLeadSource, hasAutomation, hasTeamSetup, onboardingComplete },
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { complete } = await req.json();
    await dbConnect();

    const business = await Business.findByIdAndUpdate(
      tenant.business._id,
      { onboardingComplete: complete ?? true, onboardingStep: 'completed' },
      { new: true }
    );

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { onboardingComplete: business.onboardingComplete },
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
