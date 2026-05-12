import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import Message from '@/models/automation/Message';
import Activity from '@/models/automation/Activity';
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
    console.log(`[Meta Webhook] Mode: ${mode}, Token: ${token}`);

    if (mode === 'subscribe' && token) {
        await dbConnect();
        const business = await Business.findById(businessId);
        
        if (!business) {
            console.warn(`[Meta Webhook] Business not found: ${businessId}`);
            return new Response('Business not found', { status: 404 });
        }

        let storedToken = business.integrationCredentials?.whatsapp?.verifyToken;
        let adsToken = business.integrationCredentials?.facebookAds?.verifyToken;

        const { decrypt } = await import('@/lib/encryption');

        // Helper to decrypt tokens if needed
        const resolveToken = (t) => {
            if (t && t.includes(':')) {
                try { return decrypt(t); } catch (e) { return t; }
            }
            return t;
        };

        const resolvedWhatsAppToken = resolveToken(storedToken);
        const resolvedAdsToken = resolveToken(adsToken);

        if (resolvedWhatsAppToken === token || resolvedAdsToken === token) {
            console.log(`[Meta Webhook] Verification SUCCESS for business: ${businessId}`);
            
            // AUTO-HEAL: Enable corresponding integration
            const isAds = resolvedAdsToken === token;
            const path = isAds ? 'integrationCredentials.facebookAds.enabled' : 'integrationCredentials.whatsapp.enabled';
            
            if (!business.get(path)) {
                business.set(path, true);
                business.markModified('integrationCredentials');
                await business.save();
                console.log(`[Meta Webhook] ${isAds ? 'Ads' : 'WhatsApp'} AUTO-ENABLED for ${businessId}`);
            }

            // Meta expects the challenge value returned as plain text
            return new Response(challenge, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Content-Length': challenge.length.toString()
                }
            });
        } else {
            console.warn(`[Meta Webhook] Verification FAILED. Token mismatch or business not found.`);
            console.log(`Expected: ${storedToken}, Got: ${token}`);
        }
    }

    return new Response('Verification failed', { status: 403 });
}

/**
 * POST - Handle Incoming Messages
 */
export async function POST(request, { params }) {
    const { businessId } = await params;

    try {
        await dbConnect();
        const business = await Business.findById(businessId);

        if (!business || !business.integrationCredentials?.whatsapp?.apiKey) {
            return NextResponse.json({ success: false, error: 'Business not found or WhatsApp not configured' }, { status: 404 });
        }

        const { decrypt } = await import('@/lib/encryption');
        let appSecret = business.integrationCredentials.whatsapp.appSecret;
        
        if (appSecret && appSecret.includes(':')) {
            try {
                appSecret = decrypt(appSecret);
            } catch (e) {
                console.error('[Meta Webhook] Decryption failed for appSecret');
            }
        }

        const signature = request.headers.get('x-hub-signature-256');
        const rawBody = await request.text();

        // 1. Validate Signature
        if (!verifyMetaSignature(rawBody, signature, appSecret)) {
            console.warn(`[Meta Webhook] Invalid signature from business ${businessId}`);
            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
        }

        const payload = JSON.parse(rawBody);
        
        // 2. Route by event type
        // Support both real events (entry array) and Test Tool samples
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0] || payload.sample; // Handle Test Tool "sample" key

        // --- HANDLE LEAD ADS ---
        if (change?.field === 'leadgen') {
            const leadgenId = change.value?.leadgen_id;
            console.log(`[Meta Ads Webhook] New lead detected: ${leadgenId} for business ${businessId}`);

            // Special Case: Meta Webhook Test Tool dummy ID
            if (leadgenId === '444444444444') {
                console.log('[Meta Ads Webhook] Detected TEST TOOL lead. Generating mock data.');
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
                return NextResponse.json({ success: true, status: 'mock_test_success' });
            }

            if (!business.integrationCredentials?.facebookAds?.accessToken) {
                return NextResponse.json({ success: false, error: 'Ads not configured' }, { status: 200 });
            }

            let accessToken = business.integrationCredentials.facebookAds.accessToken;
            if (accessToken.includes(':')) {
                try { accessToken = decrypt(accessToken); } catch (e) {}
            }

            try {
                const leadData = await getMetaLeadDetails(leadgenId, accessToken);
                const result = await leadManager.processMetaLead(businessId, leadData);
                return NextResponse.json({ success: true, status: result.status });
            } catch (apiError) {
                console.error('[Meta Ads Webhook] API Error fetching lead:', apiError.message);
                // Return 200 to Meta but log the error internally
                return NextResponse.json({ success: false, error: 'Meta API failure' }, { status: 200 });
            }
        }

        // --- HANDLE WHATSAPP ---
        const { extractWhatsAppPayload } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
            return NextResponse.json({ success: true, message: 'No relevant message data' });
        }

        // 3. Process via Centralized Lead Manager
        const { leadManager } = await import('@/lib/automation/leadManager');
        
        const result = await leadManager.processIncomingMessage(businessId, {
            messageId: data.messageId,
            senderId: data.fromPhone,
            senderName: data.fromName,
            body: data.text,
            type: 'text', 
            timestamp: data.timestamp,
            referral: data.referral,
            raw: data.rawMessage
        });

        console.log(`[Meta Webhook] Processed message from ${data.fromName}. Result: ${result.status}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Meta Webhook] Fatal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
    }
}
