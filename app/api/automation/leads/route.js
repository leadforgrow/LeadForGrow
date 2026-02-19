import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from "@/lib/mongodb";
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import User from '@/models/User';
import Business from '@/models/Business';
import Form from '@/models/Form';
import { processNewLead, triggerAutomationForLead } from '@/lib/leadProcessor';

// Helper to get user and business
async function getUserAndBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return { error: `Authentication required: ${new URL(request.url).pathname}`, status: 401 };
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

// GET - Fetch all leads with filters
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    const { user, business } = result;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');

    const query = { businessId: business._id, archived: false };

    // Role-based filtering: members and team_members only see leads assigned to them
    const isRestrictedRole = ['member', 'TEAM_MEMBER', 'VIEW_ONLY'].includes(user.role);

    if (isRestrictedRole) {
      query.assignedTo = user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (source) query.source = source;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { serviceInterest: { $regex: search, $options: 'i' } }
      ];
    }


    console.log('[API Leads] Query:', JSON.stringify(query));

    const leads = await Lead.find(query)
      .populate('assignedTo', 'email firstName lastName')
      .populate('formId', 'name')
      .sort({ receivedAt: -1 })
      .lean();

    console.log('[API Leads] Found leads:', leads.length);

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST - Create new lead (manual entry or API)
export async function POST(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }

    const { user, business } = result;
    const body = await request.json();

    // Validate required fields (Allow name + phone OR name + email)
    if (!body.name || (!body.phone && !body.email)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name and (phone or email)'
      }, { status: 400 });
    }

    // Check if business has reached lead limit
    if (business.hasReachedLeadLimit()) {
      return NextResponse.json({
        success: false,
        error: `Monthly lead limit reached (${business.quotas.maxLeadsPerMonth}). Please upgrade your plan.`,
        requiresUpgrade: true
      }, { status: 403 });
    }

    // Prepare lead data
    const leadData = {
      name: body.name,
      email: body.email || '',
      phone: body.phone,
      whatsapp: body.whatsapp || body.phone,
      serviceInterest: body.serviceInterest || '',
      message: body.message || '',
      source: body.source || 'manual',
      sourceDetails: body.sourceDetails || 'Manual entry',
      sourcePage: body.sourcePage || '',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      priority: body.priority || 'medium'
    };

    // Process lead through centralized processor
    console.log(`[API Leads] Creating lead for business ${business._id}:`, leadData.name);
    const processResult = await processNewLead(leadData, business._id);

    if (!processResult.success) {
      console.error(`[API Leads] Processor failed for ${leadData.name}:`, processResult.message);
      if (processResult.isDuplicate) {
        return NextResponse.json({
          success: true,
          data: processResult.lead,
          message: 'Lead already exists'
        }, { status: 200 });
      }

      return NextResponse.json({
        success: false,
        error: processResult.message || 'Failed to create lead'
      }, { status: 500 });
    }

    console.log(`[API Leads] Successfully processed lead: ${processResult.lead._id}`);

    // Trigger automation asynchronously
    setTimeout(() => {
      triggerAutomationForLead(processResult.lead._id, business._id).catch(err => {
        console.error('Automation trigger failed:', err);
      });
    }, 100);

    return NextResponse.json({
      success: true,
      data: processResult.lead
    }, { status: 201 });

  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create lead'
    }, { status: 500 });
  }
}
