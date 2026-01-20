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

    // 1. Fetch PRIMARY Business
    let business = null;
    let businessPlan = 'free';
    if (user.businessId) {
      business = await Business.findById(user.businessId);
      if (business) {
        businessPlan = business.plan || 'free';
      }
    }

    // 2. Fetch Agency Capability (if exists)
    let agency = null;
    if (user.agencyId) {
      const AgencyModel = (await import("@/models/Agency")).default;
      agency = await AgencyModel.findById(user.agencyId);
    }
    
    // Fetch stats
    const websiteCount = await Website.countDocuments({ owner: user._id });
    const totalLeads = user.businessId ? await Lead.countDocuments({ businessId: user.businessId }) : 0;

    // Return combined context
    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.fullName || user.firstName || user.email.split('@')[0],
      role: user.role,
      businessId: user.businessId,
      agencyId: user.agencyId,
      businessPlan: businessPlan, // This determines the navbar (paid/free)
      hasAgency: !!agency && agency.status === 'active',
      active: user.active,
      createdAt: user.createdAt,
      business: business ? {
        name: business.businessName,
        industry: business.industry || '',
        website: business.website || '',
        plan: businessPlan,
        usage: business.usage || {},
        quotas: business.limits || {},
      } : null,
      agency: agency ? {
        name: agency.agencyName,
        plan: agency.planName,
        status: agency.status
      } : null,
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
