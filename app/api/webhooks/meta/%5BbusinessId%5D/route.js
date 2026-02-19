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
    const { businessId } = params;
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token) {
        await dbConnect();
        const business = await Business.findById(businessId);

        if (business && business.integrationCredentials?.whatsapp?.verifyToken === token) {
            console.log(`[Meta Webhook] Verification successful for business: ${businessId}`);
            return new Response(challenge, { status: 200 });
        }
    }

    return new Response('Verification failed', { status: 403 });
}

/**
 * POST - Handle Incoming Messages
 */
export async function POST(request, { params }) {
    const { businessId } = params;

    try {
        await dbConnect();
        const business = await Business.findById(businessId);

        if (!business || !business.integrationCredentials?.whatsapp?.enabled) {
            return NextResponse.json({ success: false, error: 'Business not found or integration disabled' }, { status: 404 });
        }

        const appSecret = business.integrationCredentials.whatsapp.appSecret;
        const signature = request.headers.get('x-hub-signature-256');
        const rawBody = await request.text();

        // 1. Validate Signature
        if (!verifyMetaSignature(rawBody, signature, appSecret)) {
            console.warn(`[Meta Webhook] Invalid signature from business ${businessId}`);
            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
        }

        const payload = JSON.parse(rawBody);

        // 2. Extract Message Data
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];

        if (!message || message.type !== 'text') {
            return NextResponse.json({ success: true, message: 'Non-text content ignored' });
        }

        const incomingPhone = message.from;
        const incomingText = message.text.body;
        const externalId = message.id;

        // 3. Match Lead strictly within Business context
        const normalizedPhone = incomingPhone.replace(/\D/g, '').slice(-10);
        const lead = await Lead.findOne({
            businessId,
            $or: [
                { phone: new RegExp(normalizedPhone + '$') },
                { whatsapp: new RegExp(normalizedPhone + '$') }
            ],
            archived: false
        });

        if (!lead) {
            console.log(`[Meta Webhook] No lead found for ${incomingPhone} in business ${businessId}`);
            return NextResponse.json({ success: true, message: 'No match' });
        }

        // 4. Persistence
        const existing = await Message.findOne({ externalMessageId: externalId });
        if (existing) return NextResponse.json({ success: true, message: 'Duplicate' });

        await Message.create({
            leadId: lead._id, businessId, direction: 'incoming',
            text: incomingText, externalMessageId: externalId, timestamp: new Date()
        });

        await Activity.create({
            leadId: lead._id, businessId, type: 'whatsapp_received',
            description: `WhatsApp reply: "${incomingText.substring(0, 30)}..."`,
            performedBy: lead.assignedTo || business._id,
            performedAt: new Date(),
            metadata: { externalId, provider: 'meta' }
        });

        await Lead.findByIdAndUpdate(lead._id, {
            lastActivityAt: new Date(),
            status: lead.status === 'new' ? 'contacted' : lead.status
        });

        console.log(`[Meta Webhook] Processed message from ${lead.name}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Meta Webhook] Fatal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
    }
}
