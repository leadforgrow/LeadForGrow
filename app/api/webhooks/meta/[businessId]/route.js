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
        // 2. Extract Data using Attribution Utility
        const { extractWhatsAppPayload } = await import('@/lib/whatsapp/attribution');
        const data = extractWhatsAppPayload(payload);
        
        if (!data) {
            return NextResponse.json({ success: true, message: 'No message data' });
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
