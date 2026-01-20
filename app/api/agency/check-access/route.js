import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Business from '@/models/Business';
import Agency from '@/models/Agency';
import { isAgencyPlan } from '@/lib/agency/planResolver';

/**
 * GET /api/agency/check-access
 * Check if user has access to agency features
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId || userId === 'undefined' || userId === 'null') {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'Not authenticated'
      });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.warn('[Agency Access Check] Invalid User ID format:', userId);
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'Invalid authentication format'
      });
    }
    
    // REQUIREMENT 4: Check if Business exists, Agency exists, and Business is PAID
    const user = await User.findById(userId).populate('businessId').populate('agencyId');
    
    if (!user || !user.businessId || !user.agencyId) {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'Agency capability not found or Business not linked'
      });
    }

    const business = user.businessId;
    const agency = user.agencyId;

    // Check if Business plan is paid
    const businessPlan = (business.plan || 'free').toLowerCase();
    const isPaid = businessPlan !== 'free';

    if (!isPaid) {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'Paid Business account required for Agency access',
        currentPlan: businessPlan
      });
    }

    // Check if Agency is active
    if (agency.status !== 'active') {
      return NextResponse.json({ 
        hasAccess: false,
        reason: 'Agency account is not active'
      });
    }
    
    return NextResponse.json({ 
      hasAccess: true,
      planName: agency.planName,
      businessPlan: businessPlan
    });
    
  } catch (error) {
    console.error('[Agency Access Check] Error:', error);
    return NextResponse.json({ 
      hasAccess: false,
      reason: 'Server error'
    }, { status: 500 });
  }
}
