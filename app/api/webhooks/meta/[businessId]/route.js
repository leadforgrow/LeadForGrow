import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import { verifyMetaSignature } from '@/lib/webhookSecurity';
import { getMetaLeadDetails } from '@/lib/meta/ads';
import { leadManager } from '@/lib/automation/leadManager';

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
            return new Response('Business not found', { status: 404 });
        }

        const storedWAToken = business.integrationCredentials?.whatsapp?.verifyToken;
        const storedAdsToken = business.integrationCredentials?.facebookAds?.verifyToken;

        const { decrypt } = await import('@/lib/encryption');
        const resolveToken = (t) => {
            if (t && t.includes(':')) {
                try { return decrypt(t); } catch (e) { return t; }
            }
            return t;
        };

        const resolvedWA = resolveToken(storedWAToken);
        const resolvedAds = resolveToken(storedAdsToken);

        if (resolvedWA === token || resolvedAds === token) {
            console.log(`[Meta Webhook] ✅ Verified business: ${businessId}`);
            
            const isAds = resolvedAds === token;
            const path = isAds ? 'integrationCredentials.facebookAds.enabled' : 'integrationCredentials.whatsapp.enabled';
            if (!business.get(path)) {
                business.set(path, true);
                business.markModified('integrationCredentials');
                await business.save();
            }

            return new Response(challenge, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        console.warn(`[Meta Webhook] ❌ Token mismatch. WA:${resolvedWA} | Ads:${resolvedAds} | Got:${token}`);
    }

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
            return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get('x-hub-signature-256');

        // Signature validation — only enforce if App Secret is configured
        const { decrypt } = await import('@/lib/encryption');
        let appSecret = business.integrationCredentials?.whatsapp?.appSecret || business.integrationCredentials?.facebookAds?.appSecret;
        if (appSecret && appSecret.includes(':')) {
            try { appSecret = decrypt(appSecret); } catch (e) {}
        }

        if (appSecret && signature) {
            if (!verifyMetaSignature(rawBody, signature, appSecret)) {
                console.warn(`[Meta Webhook] ❌ Invalid signature for business ${businessId}`);
                return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
            }
        } else {
            // Meta Test Tool does not send a signature — allow through
            console.log(`[Meta Webhook] ⚠️ No App Secret / skipping signature check for ${businessId}`);
        }

        const payload = JSON.parse(rawBody);
        console.log(`[Meta Webhook] Payload received:`, JSON.stringify(payload).substring(0, 400));

        // Support both real events (entry.changes) and Meta Test Tool (sample key)
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0] || payload.sample;

        // ─── LEAD ADS ─────────────────────────────────────────────────
        if (change?.field === 'leadgen') {
            const leadgenId = change.value?.leadgen_id;
            console.log(`[Meta Ads] 🎯 leadgen_id: ${leadgenId}`);

            // Meta Test Tool dummy IDs — create a mock lead so it shows up instantly
            if (!leadgenId || leadgenId === '444444444444') {
                console.log('[Meta Ads] 🧪 Test payload detected — creating mock lead');
                const result = await leadManager.processMetaLead(businessId, {
                    metaLeadId: `test_${Date.now()}`,
                    name: 'Meta Test Lead',
                    email: 'test@meta-example.com',
                    phone: '919999999999',
                    campaignName: 'Meta Webhook Test',
                    adSetName: 'Test Ad Set',
                    adName: 'Test Ad',
                    formId: change.value?.form_id || 'test_form',
                    receivedAt: new Date(),
                    fields: { is_test: true }
                });
                console.log(`[Meta Ads] ✅ Mock lead result: ${result.status}`);
                return NextResponse.json({ success: true, status: result.status });
            }

            // Real lead — fetch full details from Meta Graph API
            let accessToken = business.integrationCredentials?.facebookAds?.accessToken;
            if (!accessToken) {
                console.error(`[Meta Ads] ❌ No access token configured for business ${businessId}`);
                return NextResponse.json({ success: false, error: 'Page Access Token not configured' }, { status: 200 });
            }

            if (accessToken.includes(':')) {
                try { accessToken = decrypt(accessToken); } catch (e) {}
            }

            const leadData = await getMetaLeadDetails(leadgenId, accessToken);
            const result = await leadManager.processMetaLead(businessId, leadData);
            console.log(`[Meta Ads] ✅ Lead saved: ${result.leadId} | ${result.status}`);
            return NextResponse.json({ success: true, status: result.status });
        }

        // ─── WHATSAPP ─────────────────────────────────────────────────
        const { extractWhatsAppPayload } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
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
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Meta Webhook] 🔥 Fatal Error:', error.message);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
