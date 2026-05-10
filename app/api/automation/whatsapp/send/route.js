import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import { sendAutoWhatsApp } from '@/lib/integrations/whatsapp';

export async function POST(request) {
    try {
        const { userId, leadId, message } = await request.json();

        if (!userId || !leadId || !message) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        await dbConnect();
        
        // 1. Get Lead
        const lead = await Lead.findById(leadId);
        if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });

        // 2. Get Business
        const business = await Business.findById(lead.businessId);
        if (!business) return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });

        // 3. Send Message via Meta (Free-form text)
        // Note: Free-form text only works if within 24h window
        const result = await sendAutoWhatsApp(lead, business, message);

        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json({ success: false, error: result.error || 'Failed to send WhatsApp' }, { status: 500 });
        }

    } catch (error) {
        console.error('[WhatsApp Send API] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
