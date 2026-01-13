import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Business from '@/models/Business';
import Website from '@/models/Website';
import Lead from '@/models/automation/Lead';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch business and usage stats
    const business = await Business.findById(user.businessId);
    
    // Fetch real counts
    const websiteCount = await Website.countDocuments({ owner: user._id });
    const totalLeads = await Lead.countDocuments({ businessId: user.businessId });

    // Return user data with plan info and stats
    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.fullName || user.firstName || user.email.split('@')[0],
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      businessId: user.businessId,
      active: user.active,
      createdAt: user.createdAt,
      business: business ? {
        name: business.businessName,
        industry: business.industry,
        website: business.website,
        plan: business.plan,
        usage: business.usage,
        quotas: business.quotas,
      } : null,
      plan: business ? business.plan : 'free',
      stats: {
        websiteCount,
        totalLeads,
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, phone, businessName, industry, businessWebsite } = body;

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update personal fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    if (firstName !== undefined || lastName !== undefined) {
      user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    await user.save();

    // Update business fields if user is owner and fields provided
    if (user.role === 'owner' || user.role === 'admin') {
      const business = await Business.findById(user.businessId);
      if (business) {
        if (businessName) business.businessName = businessName;
        if (industry) business.industry = industry;
        if (businessWebsite) business.website = businessWebsite;
        await business.save();
      }
    }

    return NextResponse.json({ message: 'Success' });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
