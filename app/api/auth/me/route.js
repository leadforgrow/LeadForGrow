import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from "@/lib/mongodb";
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return { authorized: false, error: 'User not found' };
    }

    const Business = mongoose.models.Business || (await import('@/models/Business')).default;
    const business = await Business.findById(user.businessId);
    
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        businessId: business._id,
        companyName: business.businessName,
        plan: business.plan || 'free',
        onboardingComplete: business.onboardingComplete || false,
        apiKey: business.apiKey
      }
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
