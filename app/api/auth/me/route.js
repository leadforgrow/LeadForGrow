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
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const Business = mongoose.models.Business || (await import('@/models/Business')).default;
    const business = await Business.findById(user.businessId);
    
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    const RolePermission = mongoose.models.RolePermission || (await import('@/models/RolePermission')).default;
    const rolePerm = await RolePermission.findOne({ 
      role: { $regex: new RegExp(`^${user.role}$`, 'i') } 
    });

    const permissions = rolePerm ? rolePerm.permissions : [];
    // Owners/Supers have all permissions implicitly
    if (['owner', 'super', 'agency_owner'].includes(user.role?.toLowerCase())) {
       permissions.push('dashboard_access', 'reports_access', 'live_chat_access', 'leads_view', 'leads_edit', 'leads_delete', 'team_manage', 'settings_manage', 'billing_manage');
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
        apiKey: business.apiKey,
        permissions: [...new Set(permissions)]
      }
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
