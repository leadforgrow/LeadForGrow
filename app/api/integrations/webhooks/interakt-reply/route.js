import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Business from '@/models/Business';
import Message from '@/models/automation/Message';
import Activity from '@/models/automation/Activity';

/**
 * GET /api/integrations/webhooks/interakt-reply
 * Validation endpoint for manual check
 */
export async function GET() {
    return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
}

/**
 * POST /api/integrations/webhooks/interakt-reply
 * Handles incoming WhatsApp replies from Interakt
 */
export async function POST(request) {
    try {
        const payload = await request.json();

        // 1. Data Extraction (Support both Interakt and flat test payload)
        let incomingPhone, incomingText, externalId;

        if (payload.data && payload.data.customer) {
            // Official Interakt Structure
            const { customer, message } = payload.data;
            incomingPhone = customer.phoneNumber;
            incomingText = message.text || '';
            externalId = message.id;
        } else {
            // Flat Manual Test Structure (as per Phase 1 request)
            incomingPhone = payload.phone;
            incomingText = payload.message;
            externalId = payload.messageId;
        }

        if (!incomingPhone) {
            console.log('[Webhook Interakt] Invalid payload: Missing phone');
            return NextResponse.json({ success: false, error: 'Missing phone' }, { status: 400 });
        }

        await dbConnect();

        // 2. Multi-tenant Context Extraction
        // Interakt webhooks often don't contain our proprietary Business ID.
        // We match leads globally by phone and narrow down by active business status.
        // In LFG, phone numbers are normalized without '+' or country code for lead lookup.
        // We strip non-digits, then remove leading '91' (India) or '0' (Local).
        const normalizedPhone = incomingPhone.replace(/\D/g, '').replace(/^(91|0)/, '');

        const lead = await Lead.findOne({
            $or: [{ phone: new RegExp(normalizedPhone + '$') }, { whatsapp: new RegExp(normalizedPhone + '$') }],
            archived: false
        }).sort({ receivedAt: -1 });

        if (!lead) {
            console.log(`[Webhook Interakt] No matching lead found for ${incomingPhone}`);
            return NextResponse.json({ success: true, message: 'No matching lead' });
        }

        // 3. Security & Idempotency Check
        const existing = await Message.findOne({ externalMessageId: externalId });
        if (existing) {
            return NextResponse.json({ success: true, message: 'Duplicate ignored' });
        }

        // 4. Persistence Flow (Close the Loop)
        const bizId = lead.businessId;

        // A. Save Incoming Message
        await Message.create({
            leadId: lead._id,
            businessId: bizId,
            direction: 'incoming',
            text: incomingText,
            externalMessageId: externalId,
            timestamp: new Date()
        });

        // B. Record Activity
        await Activity.create({
            leadId: lead._id,
            businessId: bizId,
            type: 'whatsapp_received',
            description: `WhatsApp reply received: "${incomingText.substring(0, 30)}..."`,
            performedBy: lead.assignedTo || lead.businessId, // Use lead owner or biz ID as fallback
            performedAt: new Date(),
            metadata: { externalId }
        });

        // C. Update Lead Pulse
        await Lead.findByIdAndUpdate(lead._id, {
            lastActivityAt: new Date(),
            status: lead.status === 'new' ? 'contacted' : lead.status // Auto-move to contacted if new
        });

        console.log(`[Webhook Interakt] Successfully processed reply from ${lead.name}`);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Webhook Interakt] Fatal Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal error'
        }, { status: 500 });
    }
}
