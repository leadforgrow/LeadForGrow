import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Message from '@/models/automation/Message';
import Conversation from '@/models/omnichannel/Conversation';
import Lead from '@/models/automation/Lead';
import Contact from '@/models/automation/Contact';
import Company from '@/models/automation/Company';
import Deal from '@/models/automation/Deal';
import { withPermissions } from '@/lib/rbac';

async function handler(req) {
  try {
    const { user } = req;
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(30, parseInt(searchParams.get('limit') || '20', 10));

    if (!q || q.length < 2) {
      return NextResponse.json({ success: false, error: 'Query too short' }, { status: 400 });
    }

    await dbConnect();
    const businessId = user.businessId;
    const regex = { $regex: q, $options: 'i' };
    const results = { messages: [], conversations: [], leads: [], contacts: [], companies: [], deals: [] };

    if (type === 'all' || type === 'messages') {
      results.messages = await Message.find({
        businessId,
        $or: [
          { 'content.body': regex },
          { subject: regex },
        ],
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('leadId conversationId channel content timestamp direction')
        .lean();
    }

    if (type === 'all' || type === 'conversations') {
      results.conversations = await Conversation.find({
        businessId,
        $or: [
          { participantName: regex },
          { participantEmail: regex },
          { participantPhone: regex },
          { lastMessagePreview: regex },
        ],
      })
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .lean();
    }

    if (type === 'all' || type === 'leads') {
      results.leads = await Lead.find({
        businessId,
        $or: [{ name: regex }, { phone: regex }, { email: regex }],
      })
        .limit(limit)
        .select('name phone email status')
        .lean();
    }

    if (type === 'all' || type === 'contacts') {
      results.contacts = await Contact.find({
        businessId,
        $or: [{ firstName: regex }, { lastName: regex }, { emails: regex }, { phones: regex }],
      })
        .limit(limit)
        .select('firstName lastName emails phones')
        .lean();
    }

    if (type === 'all' || type === 'companies') {
      results.companies = await Company.find({ businessId, name: regex }).limit(limit).select('name domain').lean();
    }

    if (type === 'all' || type === 'deals') {
      results.deals = await Deal.find({ businessId, title: regex }).limit(limit).select('title amount stage').lean();
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('[Inbox API] search:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], handler);
