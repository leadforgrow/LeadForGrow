import { dbConnect } from '@/lib/mongodb';
import OnboardingCall from '@/models/OnboardingCall';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { generateGoogleMeetLink } from '@/lib/googleMeet';
import { sendUserConfirmationEmail, sendInternalNotification } from '@/lib/onboardingEmail';

export async function POST(request) {
  try {
    await dbConnect();

    const { userId, planId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user data
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate instant Google Meet link (no API needed)
    const meetLink = generateGoogleMeetLink();

    // Create onboarding call record
    const onboardingCall = new OnboardingCall({
      userId: user._id,
      userName: user.name || user.email,
      userEmail: user.email,
      userPhone: user.phone || null,
      meetLink,
      planId: planId || null,
      status: 'scheduled_pre_payment',
    });

    await onboardingCall.save();

    // Send emails using nodemailer
    const emailResults = await Promise.allSettled([
      sendUserConfirmationEmail(user.name, user.email, meetLink),
      sendInternalNotification(user.name, user.email, user.phone, meetLink, planId),
    ]);

    // Log email results
    emailResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Email ${index + 1} sent successfully`);
      } else {
        console.error(`Email ${index + 1} failed:`, result.reason);
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
}
