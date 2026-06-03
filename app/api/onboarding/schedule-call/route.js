import { dbConnect } from '@/lib/mongodb';
import OnboardingCall from '@/models/OnboardingCall';
import { NextResponse } from 'next/server';
import { generateGoogleMeetLink } from '@/lib/googleMeet';
import { sendUserConfirmationEmail, sendInternalNotification } from '@/lib/onboardingEmail';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { user } = tenant;
    const body = await request.json().catch(() => ({}));
    const { planId } = body;

    await dbConnect();

    const meetLink = generateGoogleMeetLink();
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    const onboardingCall = new OnboardingCall({
      userId: user._id,
      userName: displayName,
      userEmail: user.email,
      userPhone: user.phone || null,
      meetLink,
      planId: planId || null,
      status: 'scheduled_pre_payment',
    });

    await onboardingCall.save();

    const emailResults = await Promise.allSettled([
      sendUserConfirmationEmail(displayName, user.email, meetLink),
      sendInternalNotification(displayName, user.email, user.phone, meetLink, planId),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`[ScheduleCall] Email ${index + 1} sent`);
      } else {
        console.error(`[ScheduleCall] Email ${index + 1} failed:`, result.reason);
      }
    });

    return NextResponse.json({
      success: true,
      meetLink,
      message: 'Setup call scheduled successfully',
    });
  } catch (error) {
    console.error('Error scheduling call:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule call', details: error.message },
      { status: 500 }
    );
  }
});
