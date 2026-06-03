import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/mongodb';
import Business from '../../../../../models/Business';
import Lead from '../../../../../models/automation/Lead';
import { sendAutoWhatsApp } from '../../../../../lib/integrations/whatsapp';
import { withPermissions } from '../../../../../lib/rbac';
import { emitChatMessage } from '../../../../../lib/realtime/publish';

/**
 * POST /api/automation/chat/send
 * Send a manual reply via WhatsApp
 */
async function handler(req) {
  try {
    const { user } = req;
    const body = await req.json();
    const { leadId, message } = body;

    if (!leadId || !message) {
      return NextResponse.json({ success: false, error: 'Lead ID and message are required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Fetch Lead and Business
    const lead = await Lead.findOne({ _id: leadId, businessId: user.businessId });
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    // 2. Send Message
    const result = await sendAutoWhatsApp(lead, business, message);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send message' }, { status: 500 });
    }

    await emitChatMessage(user.businessId, {
      leadId,
      messageId: result.messageId,
      direction: 'outbound',
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('[Chat API] Error sending message:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withPermissions(['dashboard_access', 'reports_access'], handler);
