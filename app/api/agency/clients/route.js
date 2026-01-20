import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Client from '@/models/Client';
import Agency from '@/models/Agency';
import AgencyUsage from '@/models/AgencyUsage';
import { getAgencyForUser, verifyAgencyOwnership } from '@/lib/agency/agencyGuards';
import { canCreateClient } from '@/lib/agency/limitChecker';
import { getCurrentUsage } from '@/lib/agency/usageReader';
import { resolveAgencyLimits } from '@/lib/agency/planResolver';

/**
 * GET /api/agency/clients
 * List all clients for an agency
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
    
    // Get all clients for this agency
    const clients = await Client.find({ agencyId: agency._id })
      .populate('assignedTeam', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Enhance clients with real-time health data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    const enhancedClients = await Promise.all(clients.map(async (client) => {
      // 1. Fetch Lead count & last lead date
      const Lead = (await import('@/models/automation/Lead')).default;
      const Invoice = (await import('@/models/Invoice')).default;

      const [recentLeadsCount, lastLead, overdueInvoices] = await Promise.all([
        Lead.countDocuments({ clientId: client._id, receivedAt: { $gte: thirtyDaysAgo } }),
        Lead.findOne({ clientId: client._id }).sort({ receivedAt: -1 }).select('receivedAt'),
        Invoice.countDocuments({ clientId: client._id, status: 'overdue' })
      ]);

      // 2. Health Logic
      let health = 'healthy';
      let riskFactors = [];

      if (!lastLead || lastLead.receivedAt < thirtyDaysAgo) {
        health = 'unhealthy';
        riskFactors.push('No leads in 30 days');
      } else if (lastLead.receivedAt < sevenDaysAgo) {
        health = 'at-risk';
        riskFactors.push('No leads in 7 days');
      }

      if (overdueInvoices > 0) {
        health = health === 'unhealthy' ? 'unhealthy' : 'at-risk';
        riskFactors.push(`${overdueInvoices} Overdue Invoice(s)`);
      }

      return {
        ...client,
        healthScore: {
          status: health,
          lastLeadAt: lastLead?.receivedAt,
          leadVelocity: recentLeadsCount,
          riskFactors
        }
      };
    }));
    
    return NextResponse.json({
      success: true,
      clients: enhancedClients,
      total: clients.length
    });
    
  } catch (error) {
    console.error('[Agency Clients API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/agency/clients
 * Create a new client (with limit check)
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
    
    // Check if client creation is allowed
    const check = canCreateClient(limits, usage);
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
    const { clientName, industry, website, primaryContact, notes, assignedTeam, billing } = body;
    
    if (!clientName) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    
    // Create client
    const client = await Client.create({
      agencyId: agency._id,
      clientName,
      industry,
      website,
      primaryContact,
      notes,
      assignedTeam: assignedTeam || [],
      billing: billing || { retainerAmount: 0, currency: 'INR', billingCycle: 'manual', autoGenerateInvoice: false },
      status: 'active'
    });
    
    // Increment usage
    await usage.incrementClients();
    
    return NextResponse.json({
      success: true,
      client,
      message: 'Client created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Agency Clients API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
