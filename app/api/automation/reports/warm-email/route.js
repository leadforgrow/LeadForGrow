import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { sendWarmingMail } from '@/lib/integrations/email';
import { withPlanAccess } from '@/lib/accessControl';

/**
 * Endpoint to send a warming email to improve domain reputation
 */
export const POST = withPlanAccess('reports', async (req) => {
  try {
    await dbConnect();
    const user = req.user;

    const body = await req.json();
    const { targetEmail } = body;

    if (!targetEmail) {
      return NextResponse.json({ success: false, error: 'Target email is required' }, { status: 400 });
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    // Check if SMTP is configured
    if (!business.integrationCredentials?.email?.enabled) {
      return NextResponse.json({
        success: false,
        error: 'Email integration is not enabled. Please configure SMTP settings first.'
      }, { status: 400 });
    }

    const result = await sendWarmingMail(business, targetEmail);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Warming email sent to ${targetEmail}. Please check your inbox and spam folder.`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send warming email'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Warming email error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
});
