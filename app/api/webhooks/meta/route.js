import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Business from '../../../../models/Business';
import { validateMetaSignature } from '../../../../lib/whatsapp/security';
import { parseMetaWebhook } from '../../../../lib/whatsapp/parser';
import { leadManager } from '../../../../lib/automation/leadManager';

/**
 * UNIFIED META WEBHOOK HANDLER
 * Handles Handshake (GET) and Production Ingestion (POST)
 */

// GET: Webhook Verification (Handshake)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify against a global fallback or let businesses have unique tokens? 
  // For SaaS MVP, we usually check against a configured verify token in ENV.
  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('[Webhook] Verification Successful');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// POST: Message Ingestion
export async function POST(req) {
  const startTime = Date.now();
  
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const payload = JSON.parse(rawBody);

    // 1. Fast Fail: If it's just a status update (delivered/read), ignore for now to keep MVP lean
    const value = payload.entry?.[0]?.changes?.[0]?.value;
    if (value?.statuses) {
      return NextResponse.json({ status: 'ignored_status_update' }, { status: 200 });
    }

    // 2. Parse Payload
    const parsedData = parseMetaWebhook(payload);
    if (!parsedData) {
      return NextResponse.json({ status: 'invalid_payload' }, { status: 200 });
    }

    await dbConnect();

    // 3. Business Lookup (Multi-Tenant Safety)
    const business = await Business.findOne({ 
      'integrationCredentials.whatsapp.phoneNumberId': parsedData.phoneNumberId 
    }).select('+integrationCredentials.whatsapp.appSecret');

    if (!business) {
      console.warn(`[Webhook] Business not found for PhoneID: ${parsedData.phoneNumberId}`);
      return NextResponse.json({ status: 'business_not_found' }, { status: 200 });
    }

    // 4. Security Validation
    const isValid = validateMetaSignature(
      rawBody, 
      signature, 
      business.integrationCredentials.whatsapp.appSecret || process.env.META_APP_SECRET
    );

    if (!isValid) {
      console.error('[Webhook] Invalid Signature for Business:', business._id);
      return NextResponse.json({ status: 'unauthorized' }, { status: 200 }); // Still 200 to Meta to avoid retries, but we log error
    }

    // 5. Process Lead (Async - we don't 'await' heavily if we want sub-200ms, but for MVP consistency we await)
    await leadManager.processIncomingMessage(business._id, parsedData);

    const duration = Date.now() - startTime;
    console.log(`[Webhook] Processed message from ${parsedData.senderId} for ${business.businessName} in ${duration}ms`);

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] Critical Runtime Error:', error);
    // ALWAYS return 200 to Meta to prevent retry loops
    return NextResponse.json({ status: 'error', message: 'Internal Handled' }, { status: 200 });
  }
}
