import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.businessId) {
      return NextResponse.json({ success: false, error: 'Business not found for this user' }, { status: 404 });
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    // Only allow switching from 'free' to 'trial'
    if (business.plan !== 'free') {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot activate trial. Current plan is ${business.plan}` 
      }, { status: 400 });
    }

    business.plan = 'trial';
    // Reset quotas/usage if necessary, but the model's pre-save hook handles quotas
    await business.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Trial activated successfully',
      plan: 'trial'
    });

  } catch (error) {
    console.error('Error activating trial:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
