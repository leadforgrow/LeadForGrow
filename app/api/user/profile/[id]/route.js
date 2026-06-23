import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Business from '@/models/Business';
import Website from '@/models/Website';
import Lead from '@/models/automation/Lead';
import { resolveFeatureFlags, resolveQuotas, groupFeatures } from '@/lib/business/featureCatalog';
import { getPlanLabel } from '@/lib/plans';
import { NextResponse } from 'next/server';

function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let business = null;
    let businessPlan = 'free';
    if (user.businessId) {
      business = await Business.findById(user.businessId).lean();
      if (business) businessPlan = business.plan || 'free';
    }

    let agency = null;
    if (user.agencyId) {
      const AgencyModel = (await import('@/models/Agency')).default;
      agency = await AgencyModel.findById(user.agencyId).lean();
    }

    const websiteCount = await Website.countDocuments({ owner: user._id });
    const totalLeads = user.businessId
      ? await Lead.countDocuments({ businessId: user.businessId })
      : 0;

    const quotas = business ? resolveQuotas(business) : resolveQuotas(null);
    const featureFlags = business ? resolveFeatureFlags(business) : resolveFeatureFlags(null);
    const featureGroups = groupFeatures(featureFlags);

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email?.split('@')[0] ||
      'User';

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      name: displayName,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role,
      businessId: user.businessId,
      agencyId: user.agencyId,
      businessPlan,
      planLabel: getPlanLabel(businessPlan),
      hasAgency: !!agency && agency.status === 'active',
      active: user.active,
      createdAt: user.createdAt,
      business: business
        ? {
            name: business.businessName,
            industry: business.industry || '',
            website: business.website || '',
            plan: businessPlan,
            planLabel: getPlanLabel(businessPlan),
            usage: business.usage || {},
            quotas,
            featureFlags,
            featureGroups,
            status: business.status || 'active',
          }
        : null,
      agency: agency
        ? {
            name: agency.agencyName,
            plan: agency.planName,
            status: agency.status,
          }
        : null,
      stats: {
        websiteCount,
        totalLeads,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile', detail: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, businessName, industry, businessWebsite } = body;

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    if (user.businessId && (user.role === 'owner' || user.role === 'admin' || user.role === 'CLIENT_ADMIN')) {
      const business = await Business.findById(user.businessId);
      if (business) {
        if (businessName !== undefined) business.businessName = businessName;
        if (industry !== undefined) business.industry = industry;
        if (businessWebsite !== undefined) business.website = businessWebsite;
        await business.save();
      }
    }

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
