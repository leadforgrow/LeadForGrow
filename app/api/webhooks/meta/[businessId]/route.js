import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import Message from '@/models/automation/Message';
import Activity from '@/models/automation/Activity';
import { verifyMetaSignature } from '@/lib/webhookSecurity';

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

        const { decrypt } = await import('@/lib/encryption');
        let storedToken = business.integrationCredentials?.whatsapp?.verifyToken;

        // Decrypt if it's an encrypted string
        if (storedToken && storedToken.includes(':')) {
            try {
                storedToken = decrypt(storedToken);
            } catch (e) {
                console.error('[Meta Webhook] Decryption failed for verifyToken');
            }
        }

        if (storedToken === token) {
            console.log(`[Meta Webhook] Verification SUCCESS for business: ${businessId}`);
            
            // AUTO-HEAL: Force enable the integration if verification is successful
            if (!business.integrationCredentials?.whatsapp?.enabled) {
                business.set('integrationCredentials.whatsapp.enabled', true);
                business.markModified('integrationCredentials');
                await business.save();
                console.log(`[Meta Webhook] Integration AUTO-ENABLED for business: ${businessId}`);
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
        
        // 2. Extract Data using Attribution Utility
        const { extractWhatsAppPayload, parseWhatsAppReferral } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
            return NextResponse.json({ success: true, message: 'No message data' });
        }

        const { fromPhone, fromName, text, timestamp, messageId, referral } = data;

        // 3. Match or Create Lead
        const normalizedPhone = fromPhone.replace(/\D/g, '').slice(-10);
        let lead = await Lead.findOne({
            businessId,
            $or: [
                { phone: new RegExp(normalizedPhone + '$') },
                { whatsapp: new RegExp(normalizedPhone + '$') }
            ],
            archived: false
        });

        const attribution = parseWhatsAppReferral(data.rawMessage);

        if (!lead) {
            console.log(`[Meta Webhook] Creating NEW lead for ${fromPhone} (Source: ${attribution.source})`);
            lead = await Lead.create({
                businessId,
                name: fromName,
                phone: fromPhone,
                whatsapp: fromPhone,
                source: attribution.source,
                sourceDetails: attribution.sourceDetails,
                status: 'new',
                ...(attribution.isAd ? attribution.adMetadata : {})
            });
        } else {
            // Update attribution if it's a new ad click for an existing lead
            if (attribution.isAd) {
                await Lead.findByIdAndUpdate(lead._id, {
                    source: attribution.source,
                    sourceDetails: attribution.sourceDetails,
                    ...attribution.adMetadata
                });
            }
        }

        // 4. Persistence & Conversation Threading
        const existing = await Message.findOne({ externalMessageId: messageId });
        if (existing) return NextResponse.json({ success: true, message: 'Duplicate' });

        await Message.create({
            leadId: lead._id, businessId, direction: 'incoming',
            text: text, externalMessageId: messageId, timestamp
        });

        await Activity.create({
            leadId: lead._id, businessId, type: 'whatsapp_received',
            description: `WhatsApp (${attribution.isAd ? 'Ad' : 'Organic'}): "${text.substring(0, 30)}..."`,
            performedBy: lead.assignedTo || business._id,
            performedAt: new Date(),
            metadata: { 
                externalId: messageId, 
                provider: 'meta',
                isAd: attribution.isAd,
                adId: attribution.adMetadata?.adId 
            }
        });

        await Lead.findByIdAndUpdate(lead._id, {
            lastActivityAt: new Date(),
            status: lead.status === 'new' ? 'contacted' : lead.status,
            isRead: false // Mark as unread for the sidebar
        });

        // 5. Trigger Automation (Acknowledgment/Rules)
        const { queueAutomation } = await import('@/lib/queue');
        queueAutomation(lead, 'onLeadReceived').catch(err => console.error('[Webhook:Automation] Error:', err));

        console.log(`[Meta Webhook] Processed ${attribution.isAd ? 'AD' : 'Organic'} message from ${lead.name}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Meta Webhook] Fatal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
    }
}
