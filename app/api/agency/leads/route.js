import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Client from '@/models/Client';
import { verifyClientOwnership } from '@/lib/agency/agencyGuards';
import { canIngestLeads } from '@/lib/agency/limitChecker';
import { getCurrentUsage } from '@/lib/agency/usageReader';
import { resolveAgencyLimits } from '@/lib/agency/planResolver';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip = (page - 1) * limit;

    const query = { agencyId: agency._id };
    if (clientId) {
      const isOwner = await verifyClientOwnership(clientId, agency._id.toString());
      if (!isOwner) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      query.clientId = clientId;
    }
    if (status) query.status = status;

    const [leads, total] = await Promise.all([
      Lead.find(query).populate('clientId', 'clientName').sort({ receivedAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, leads, total, limit, skip, page });
  } catch (error) {
    console.error('[Agency Leads API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const usage = await getCurrentUsage(agency._id.toString());
    const limits = resolveAgencyLimits(agency);
    const check = canIngestLeads(limits, usage, 1);

    if (!check.allowed) {
      return NextResponse.json(
        { error: check.reason, code: check.code, current: check.current, max: check.max },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { clientId, name, email, phone, whatsapp, serviceInterest, message, source } = body;

    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 });
    }

    const isOwner = await verifyClientOwnership(clientId, agency._id.toString());
    if (!isOwner) {
      return NextResponse.json({ error: 'Client not found or does not belong to your agency' }, { status: 404 });
    }

    const client = await Client.findById(clientId);
    const lead = await Lead.create({
      agencyId: agency._id,
      clientId,
      businessId: client.businessId || client.agencyId,
      name,
      email,
      phone,
      whatsapp,
      serviceInterest,
      message,
      source: source || 'manual',
      status: 'new',
      receivedAt: new Date(),
    });

    await usage.incrementLeads(1);
    return NextResponse.json({ success: true, lead, message: 'Lead created successfully' }, { status: 201 });
  } catch (error) {
    console.error('[Agency Leads API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
