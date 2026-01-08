import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { ingestLead } from '@/lib/leadProcessor';

/**
 * POST /api/integrations/webhooks/[secret]
 * External Webhook Gateway for third-party websites and apps.
 */
export async function POST(request, { params }) {
  try {
    const { secret } = params;
    const payload = await request.json();

    if (!secret || !payload) {
      return NextResponse.json({ success: false, error: 'Missing secret or payload' }, { status: 400 });
    }

    await dbConnect();

    // 1. Authenticate Business via Webhook Secret
    const business = await Business.findOne({ webhookSecret: secret, status: 'active' });
    if (!business) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
    }

    // 2. Client Metadata
    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 3. Hand off to Unified Ingestion Engine
    // Webhooks are flexible, so we pass the payload directly.
    // ingestLead handles normalization (name, email, phone mapping).
    const result = await ingestLead(payload, business._id, {
      source: 'webhook',
      sourceDetails: payload.source_name || 'External Site',
      ipAddress,
      extra: {
        raw_webhook_id: secret.substring(0, 10) + '...'
      }
    });

    // 4. Update Webhook Health Statistics
    business.integrationHealth.webhooks.status = 'active';
    business.integrationHealth.webhooks.lastSuccessAt = new Date();
    business.integrationHealth.webhooks.totalCount += 1;
    await business.save();

    return NextResponse.json({
      success: true,
      message: 'Lead received successfully',
      leadId: result.leadId
    });

  } catch (error) {
    console.error('[Webhook Gateway] Error:', error);

    // If we have a secret, we can try to log the error to the specific business
    try {
      const { secret } = params;
      const biz = await Business.findOne({ webhookSecret: secret });
      if (biz) {
        biz.integrationHealth.webhooks.status = 'error';
        biz.integrationHealth.webhooks.lastError = error.message;
        await biz.save();
      }
    } catch (e) {
      // Ignore secondary error
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * OPTIONS - Support preflight for flexible integrations
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
