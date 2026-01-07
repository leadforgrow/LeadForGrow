import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import User from '@/models/User';

// Helper to get user and business
async function getUserAndBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return { error: 'Authentication required', status: 401 };
  }
  
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  const business = await Business.findById(user.businessId);
  if (!business) {
    return { error: 'Business not found', status: 404 };
  }
  
  return { user, business };
}

// GET - Fetch business settings
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    return NextResponse.json({ success: true, data: business.settings });
  } catch (error) {
    console.error('Error fetching business settings:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

// PUT - Update business settings
export async function PUT(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const body = await request.json();
    const { assignmentStrategy, notifications, businessHours, autoResponse } = body;
    
    if (assignmentStrategy) {
      business.settings.assignmentStrategy = assignmentStrategy;
    }
    
    if (notifications) {
      business.settings.notifications = { ...business.settings.notifications, ...notifications };
    }
    
    if (businessHours) {
      business.settings.businessHours = { ...business.settings.businessHours, ...businessHours };
    }
    
    if (autoResponse) {
      business.settings.autoResponse = { ...business.settings.autoResponse, ...autoResponse };
    }
    
    await business.save();
    
    return NextResponse.json({ success: true, data: business.settings });
  } catch (error) {
    console.error('Error updating business settings:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
