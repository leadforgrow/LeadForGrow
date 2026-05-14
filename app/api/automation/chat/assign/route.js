import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../../lib/mongodb';
import WhatsAppConversation from '../../../../../models/automation/WhatsAppConversation';
import Lead from '../../../../../models/automation/Lead';
import { withPermissions } from '../../../../../lib/rbac';

/**
 * POST /api/automation/chat/assign
 * Assign a conversation and its lead to a team member
 */
async function handler(req) {
  try {
    const { user } = req;
    const { conversationId, assignedTo } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ success: false, error: 'Conversation ID is required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Update Conversation
    const conversation = await WhatsAppConversation.findOneAndUpdate(
      { _id: conversationId, businessId: user.businessId },
      { $set: { assignedTo: assignedTo || null } },
      { new: true }
    ).populate('assignedTo', 'firstName lastName email');

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    // 2. Update Lead Assignment as well
    if (conversation.leadId) {
      await Lead.findOneAndUpdate(
        { _id: conversation.leadId, businessId: user.businessId },
        { $set: { assignedTo: assignedTo || null } }
      );
    }

    return NextResponse.json({ success: true, data: conversation });

  } catch (error) {
    console.error('[Chat API] Error assigning conversation:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withPermissions(['dashboard_access', 'reports_access'], handler);
