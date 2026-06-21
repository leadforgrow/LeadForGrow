import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { verifyMetaSignature } from '@/lib/webhookSecurity';
import { getMetaLeadDetails } from '@/lib/meta/ads';
import { resolveMetaAdsCredentials } from '@/lib/meta/credentials';
import { leadManager } from '@/lib/automation/leadManager';

function findLeadgenChange(payload) {
  if (payload?.sample?.field === 'leadgen') {
    return payload.sample;
  }

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change?.field === 'leadgen') {
        return change;
      }
    }
  }

  return null;
}

/**
 * GET - Meta Webhook Verification (The Challenge)
 */
export async function GET(request, { params }) {
    const { businessId } = await params;
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log(`[Meta Webhook] Verification request for business: ${businessId}`);

    if (mode === 'subscribe' && token) {
        await dbConnect();
        const business = await Business.findById(businessId);
        
        if (!business) {
            console.log(`[Meta Webhook] GET return: business not found (${businessId})`);
            return new Response('Business not found', { status: 404 });
        }

        const metaCreds = await resolveMetaAdsCredentials(business);
        const storedWAToken = business.integrationCredentials?.whatsapp?.verifyToken;

        const { decrypt } = await import('@/lib/encryption');
        const resolveToken = (t) => {
            if (t && t.includes(':')) {
                try { return decrypt(t); } catch (e) { return t; }
            }
            return t;
        };

        const resolvedWA = resolveToken(storedWAToken);
        const resolvedAds = metaCreds.verifyToken;

        if (resolvedWA === token || resolvedAds === token) {
            console.log(`[Meta Webhook] ✅ Verified business: ${businessId}`);
            
            const isAds = resolvedAds === token;
            const path = isAds ? 'integrationCredentials.facebookAds.enabled' : 'integrationCredentials.whatsapp.enabled';
            if (!business.get(path)) {
                business.set(path, true);
                business.markModified('integrationCredentials');
                await business.save();
            }

            console.log(`[Meta Webhook] GET return: hub.challenge for ${businessId}`);
            return new Response(challenge, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        console.warn(`[Meta Webhook] ❌ Token mismatch. WA:${resolvedWA} | Ads:${resolvedAds} | Got:${token}`);
    }

    console.log(`[Meta Webhook] GET return: verification failed (${businessId})`);
    return new Response('Verification failed', { status: 403 });
}

/**
 * POST - Handle Incoming Webhook Events (Lead Ads + WhatsApp)
 */
export async function POST(request, { params }) {
    const { businessId } = await params;

    try {
        await dbConnect();
        const business = await Business.findById(businessId);

        if (!business) {
            console.log(`[Meta Webhook] POST return: business not found (${businessId})`);
            return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get('x-hub-signature-256');
        const payload = JSON.parse(rawBody);

        console.log('[Meta Webhook] POST object:', payload.object);
        console.log('[Meta Webhook] POST entry count:', payload.entry?.length ?? 0);
        console.log('[Meta Webhook] POST full body:', rawBody);

        const metaCreds = await resolveMetaAdsCredentials(business);
        console.log(`[Meta Ads] Credentials source: ${metaCreds.source}, pageId: ${metaCreds.pageId}, tokenPresent: ${Boolean(metaCreds.accessToken)}`);

        // Signature validation — use Meta Ads app secret (not WhatsApp) for leadgen webhooks
        const appSecret = metaCreds.appSecret;

        if (appSecret && signature) {
            if (!verifyMetaSignature(rawBody, signature, appSecret)) {
                console.warn(`[Meta Webhook] ❌ Invalid signature for business ${businessId}`);
                console.log('[Meta Webhook] POST return: invalid signature');
                return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
            }
            console.log(`[Meta Webhook] ✅ Signature verified for ${businessId}`);
        } else if (signature && !appSecret) {
            console.warn(`[Meta Webhook] ⚠️ Signature present but Meta Ads appSecret missing for ${businessId}`);
        } else {
            console.log(`[Meta Webhook] ⚠️ No signature / appSecret — allowing (Meta test tool) for ${businessId}`);
        }

        const leadgenChange = findLeadgenChange(payload);

        if (leadgenChange) {
            const value = leadgenChange.value || {};
            const leadgenId = value.leadgen_id != null ? String(value.leadgen_id) : null;
            const pageId = value.page_id != null ? String(value.page_id) : null;
            const formId = value.form_id != null ? String(value.form_id) : null;

            console.log('[Meta Ads] leadgen change detected');
            console.log('[Meta Ads] leadgen_id:', leadgenId);
            console.log('[Meta Ads] page_id:', pageId);
            console.log('[Meta Ads] form_id:', formId);

            if (metaCreds.pageId && pageId && metaCreds.pageId !== pageId) {
                console.warn(`[Meta Ads] ⚠️ page_id mismatch — webhook page ${pageId}, configured page ${metaCreds.pageId}`);
                console.log('[Meta Webhook] POST return: page_id mismatch');
                return NextResponse.json({ success: false, error: 'Page ID mismatch' }, { status: 200 });
            }

            if (!leadgenId) {
                console.error('[Meta Ads] ❌ leadgen webhook missing leadgen_id — cannot fetch lead');
                console.log('[Meta Webhook] POST return: missing leadgen_id');
                return NextResponse.json({ success: false, error: 'Missing leadgen_id' }, { status: 200 });
            }

            const accessToken = metaCreds.accessToken;
            if (!accessToken) {
                console.error(`[Meta Ads] ❌ No Page Access Token for business ${businessId}`);
                console.log('[Meta Webhook] POST return: missing access token');
                return NextResponse.json({ success: false, error: 'Page Access Token not configured' }, { status: 200 });
            }

            let leadData;
            try {
                leadData = await getMetaLeadDetails(leadgenId, accessToken);
            } catch (graphError) {
                console.error(`[Meta Ads] ❌ Graph API fetch failed for ${leadgenId}:`, graphError.message);
                console.log('[Meta Webhook] POST return: Graph API error');
                return NextResponse.json({ success: false, error: graphError.message }, { status: 200 });
            }

            const result = await leadManager.processMetaLead(businessId, leadData);
            console.log(`[Meta Ads] ✅ Lead saved: ${result.leadId} | ${result.status}`);
            console.log('[Meta Webhook] POST return: lead processed');
            return NextResponse.json({ success: true, status: result.status, leadId: result.leadId });
        }

        // ─── WHATSAPP ─────────────────────────────────────────────────
        const { extractWhatsAppPayload } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
            console.log('[Meta Webhook] POST return: no actionable event');
            return NextResponse.json({ success: true, message: 'No actionable event' });
        }

        const waResult = await leadManager.processIncomingMessage(businessId, {
            messageId: data.messageId,
            senderId: data.fromPhone,
            senderName: data.fromName,
            body: data.text,
            type: 'text',
            timestamp: data.timestamp,
            referral: data.referral,
            raw: data.rawMessage
        });

        console.log(`[Meta Webhook] WhatsApp processed: ${waResult.status}`);
        console.log('[Meta Webhook] POST return: whatsapp processed');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Meta Webhook] 🔥 Fatal Error:', error.message);
        console.error('[Meta Webhook] Stack:', error.stack);
        console.log('[Meta Webhook] POST return: 500 internal error');
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
