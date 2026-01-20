import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Client from '@/models/Client';
import AgencyUsage from '@/models/AgencyUsage';
import { getAgencyForUser, verifyClientOwnership } from '@/lib/agency/agencyGuards';
import { canIngestLeads } from '@/lib/agency/limitChecker';
import { getCurrentUsage } from '@/lib/agency/usageReader';
import { resolveAgencyLimits } from '@/lib/agency/planResolver';

/**
 * GET /api/agency/leads
 * List leads for an agency (optionally filtered by client)
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get agency for user
    const agency = await getAgencyForUser(userId);
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    // Build query
    const query = { agencyId: agency._id };
    if (clientId) {
      // Verify client belongs to agency
      const isOwner = await verifyClientOwnership(clientId, agency._id.toString());
      if (!isOwner) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      query.clientId = clientId;
    }
    if (status) {
      query.status = status;
    }
    
    // Get leads
    const leads = await Lead.find(query)
      .populate('clientId', 'clientName')
      .sort({ receivedAt: -1 })
      .limit(limit)
      .skip(skip);
    
    // Get total count
    const total = await Lead.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      leads,
      total,
      limit,
      skip
    });
    
  } catch (error) {
    console.error('[Agency Leads API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/agency/leads
 * Create a new lead for a client (with limit check)
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get agency for user
    const agency = await getAgencyForUser(userId);
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    
    // Get current usage and limits
    const usage = await getCurrentUsage(agency._id.toString());
    const limits = resolveAgencyLimits(agency);
    
    // Check if lead ingestion is allowed
    const check = canIngestLeads(limits, usage, 1);
    if (!check.allowed) {
      return NextResponse.json({
        error: check.reason,
        code: check.code,
        current: check.current,
        max: check.max
      }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { clientId, name, email, phone, whatsapp, serviceInterest, message, source } = body;
    
    // Validate required fields
    if (!clientId || !name) {
      return NextResponse.json({
        error: 'Client ID and name are required'
      }, { status: 400 });
    }
    
    // Verify client belongs to agency
    const isOwner = await verifyClientOwnership(clientId, agency._id.toString());
    if (!isOwner) {
      return NextResponse.json({
        error: 'Client not found or does not belong to your agency'
      }, { status: 404 });
    }
    
    // Get client for businessId
    const client = await Client.findById(clientId);
    
    // Create lead
    const lead = await Lead.create({
      agencyId: agency._id,
      clientId,
      businessId: client.agencyId, // Link to agency as business
      name,
      email,
      phone,
      whatsapp,
      serviceInterest,
      message,
      source: source || 'manual',
      status: 'new',
      receivedAt: new Date()
    });
    
    // Increment usage
    await usage.incrementLeads(1);
    
    return NextResponse.json({
      success: true,
      lead,
      message: 'Lead created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Agency Leads API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
