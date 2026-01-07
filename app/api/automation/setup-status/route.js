import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import LeadSource from '@/models/automation/LeadSource';
import AutomationRule from '@/models/automation/AutomationRule';
import TeamMember from '@/models/automation/TeamMember';
import User from '@/models/User';
import Business from '@/models/Business';
import Form from '@/models/Form';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const businessId = user.businessId;
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }
    
    // Step 1: Check Lead Sources (Forms or LeadSources)
    const formsCount = await Form.countDocuments({ businessId });
    const leadSourcesCount = await LeadSource.countDocuments({ businessId, status: { $in: ['Connected', 'Active'] } });
    const hasLeadSource = formsCount > 0 || leadSourcesCount > 0;
    
    // Step 2: Check Automation Rules
    const activeRules = await AutomationRule.find({ 
      businessId, 
      enabled: true,
      type: { $in: ['instant_acknowledgement', 'notify_team', 'follow_up_reminder'] }
    });
    const hasAutomation = activeRules.length >= 2;
    
    // Step 3: Check Team/Ownership
    const teamMembers = await TeamMember.find({ businessId });
    // If the business is solo, the owner counts as the team setup if they've explored it, 
    // but here we check if any team members exist (other than owner if needed)
    // Actually, usually just checking if they've interacted with team settings.
    const hasTeamSetup = teamMembers.length > 0 || business.plan !== 'free';
    
    // The source of truth is now the Business record
    const onboardingComplete = business.onboardingComplete || (hasLeadSource && hasAutomation);
    
    return NextResponse.json({
      success: true,
      data: {
        hasLeadSource,
        hasAutomation,
        hasTeamSetup,
        onboardingComplete
      }
    });
    
  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Mark onboarding as complete
export async function POST(request) {
  try {
    await dbConnect();
    const { userId, complete } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const business = await Business.findByIdAndUpdate(
      user.businessId, 
      { onboardingComplete: complete ?? true, onboardingStep: 'completed' },
      { new: true }
    );

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { onboardingComplete: business.onboardingComplete }
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
