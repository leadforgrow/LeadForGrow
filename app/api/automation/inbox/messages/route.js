import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/automation/Message';
import Conversation from '@/models/omnichannel/Conversation';
import { withPermissions } from '@/lib/rbac';

async function handler(req) {
  try {
    const { user } = req;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const leadId = searchParams.get('leadId');
    const before = searchParams.get('before');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));

    await dbConnect();

    const query = { businessId: user.businessId };
    if (conversationId) query.conversationId = conversationId;
    else if (leadId) query.leadId = leadId;
    else {
      return NextResponse.json({ success: false, error: 'conversationId or leadId required' }, { status: 400 });
    }

    if (before) query.timestamp = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('[Inbox API] messages:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], handler);
