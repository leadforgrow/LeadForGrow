import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/mongodb';
import Message from '../../../../../models/automation/Message';
import Lead from '../../../../../models/automation/Lead';
import WhatsAppConversation from '../../../../../models/automation/WhatsAppConversation';
import { withPermissions } from '../../../../../lib/rbac';

/**
 * GET /api/automation/chat/messages
 * Fetch message history for a lead
 */
async function handler(req) {
  try {
    const { user } = req;
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Verify access (Security: Ensure lead belongs to business)
    const lead = await Lead.findOne({
      _id: leadId,
      businessId: user.businessId
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found or unauthorized' }, { status: 404 });
    }

    // 2. Fetch Messages
    const messages = await Message.find({
      businessId: user.businessId,
      leadId
    })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

    // Reverse to get chronological order for UI
    const chronologicalMessages = messages.reverse();

    return NextResponse.json({
      success: true,
      data: chronologicalMessages,
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error('[Chat API] Error fetching messages:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], handler);
