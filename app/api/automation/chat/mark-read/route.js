import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/mongodb';
import WhatsAppConversation from '../../../../../models/automation/WhatsAppConversation';
import { withPermissions } from '../../../../../lib/rbac';

/**
 * POST /api/automation/chat/mark-read
 * Manually mark a conversation as read or unread
 */
async function handler(req) {
  try {
    const { user } = req;
    const { leadId, status } = await req.json(); // status: 'read' or 'unread'

    if (!leadId || !['read', 'unread', 'intervened'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    await dbConnect();

    const update = {
      status,
      unreadCount: (status === 'read' || status === 'intervened') ? 0 : 1
    };

    const conversation = await WhatsAppConversation.findOneAndUpdate(
      { businessId: user.businessId, leadId },
      { 
        $set: update,
        $setOnInsert: {
          lastMessageAt: new Date(),
          lastMessagePreview: 'Manual status update'
        }
      },
      { new: true, upsert: true }
    );

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: conversation });

  } catch (error) {
    console.error('[Chat API] Error marking as read:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withPermissions(['dashboard_access', 'reports_access'], handler);
