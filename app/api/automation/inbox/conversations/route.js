import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Conversation from '@/models/omnichannel/Conversation';
import Lead from '@/models/automation/Lead';
import { withPermissions } from '@/lib/rbac';
import { syncLegacyWhatsAppConversations } from '@/lib/omnichannel/conversationService';

async function handler(req) {
  try {
    const { user } = req;
    const { searchParams } = new URL(req.url);

    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const inboxStatus = searchParams.get('inboxStatus');
    const search = searchParams.get('search');
    const label = searchParams.get('label');
    const archived = searchParams.get('archived') === 'true';
    const spam = searchParams.get('spam') === 'true';
    const pinned = searchParams.get('pinned') === 'true';
    const favorite = searchParams.get('favorite') === 'true';
    const assignedTo = searchParams.get('assignedTo');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '30', 10));
    const skip = (page - 1) * limit;

    await dbConnect();
    await syncLegacyWhatsAppConversations(user.businessId);

    const query = { businessId: user.businessId };

    if (channel && channel !== 'all') query.channel = channel;
    if (archived) query.isArchived = true;
    else query.isArchived = { $ne: true };
    if (spam) query.isSpam = true;
    else query.isSpam = { $ne: true };
    query.isDeleted = { $ne: true };
    const andClauses = [
      { $or: [{ snoozedUntil: null }, { snoozedUntil: { $exists: false } }, { snoozedUntil: { $lte: new Date() } }] },
    ];
    if (pinned) query.isPinned = true;
    if (favorite) query.isFavorite = true;
    if (assignedTo === 'me') query.assignedTo = user.userId;
    else if (assignedTo === 'unassigned') query.assignedTo = null;
    else if (assignedTo) query.assignedTo = assignedTo;

    if (inboxStatus) query.inboxStatus = inboxStatus;
    else if (status === 'unread') query.inboxStatus = 'unread';
    else if (status === 'intervened') query.inboxStatus = 'intervened';
    else if (status === 'assigned') query.assignedTo = { $ne: null };
    else if (status === 'unassigned') query.assignedTo = null;

    if (label) query['labels.name'] = label;

    if (search) {
      const leads = await Lead.find({
        businessId: user.businessId,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const leadIds = leads.map((l) => l._id);
      andClauses.push({
        $or: [
          { leadId: { $in: leadIds } },
          { participantName: { $regex: search, $options: 'i' } },
          { participantEmail: { $regex: search, $options: 'i' } },
          { participantPhone: { $regex: search, $options: 'i' } },
          { lastMessagePreview: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (andClauses.length) query.$and = andClauses;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .populate('leadId', 'name phone email status priority assignedTo whatsappId')
        .populate('assignedTo', 'firstName lastName email')
        .populate('contactId', 'firstName lastName email phones')
        .populate('companyId', 'name')
        .populate('dealId', 'title amount stage')
        .sort({ isPinned: -1, lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[Inbox API] conversations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export const GET = withPermissions(['dashboard_access', 'reports_access'], handler);
