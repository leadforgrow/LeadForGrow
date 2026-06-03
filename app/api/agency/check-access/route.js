import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Business from '@/models/Business';
import Agency from '@/models/Agency';
import { withAuth } from '@/lib/auth';

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();

    const userId = req.user.userId;
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json({ hasAccess: false, reason: 'Invalid authentication format' });
    }

    const user = await User.findById(userId).populate('businessId').populate('agencyId');

    if (!user || !user.businessId || !user.agencyId) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Agency capability not found or Business not linked',
      });
    }

    const business = user.businessId;
    const agency = user.agencyId;
    const businessPlan = (business.plan || 'free').toLowerCase();
    const isPaid = businessPlan !== 'free';

    if (!isPaid) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Paid Business account required for Agency access',
        currentPlan: businessPlan,
      });
    }

    if (agency.status !== 'active') {
      return NextResponse.json({ hasAccess: false, reason: 'Agency account is not active' });
    }

    return NextResponse.json({
      hasAccess: true,
      planName: agency.planName,
      businessPlan,
    });
  } catch (error) {
    console.error('[Agency Access Check] Error:', error);
    return NextResponse.json({ hasAccess: false, reason: 'Server error' }, { status: 500 });
  }
});
