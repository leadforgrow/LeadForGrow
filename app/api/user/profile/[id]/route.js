import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data with plan info
    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.fullName || user.firstName || user.email.split('@')[0],
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      plan: user.plan || 'free', // Default to free if no plan
      role: user.role,
      businessId: user.businessId,
      active: user.active,
      createdAt: user.createdAt,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
