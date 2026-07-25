import { NextResponse } from 'next/server';
import { escapeRegex } from '@/lib/crm/queryBuilder';
import { dbConnect } from '../../../../../lib/mongodb';
import WhatsAppConversation from '../../../../../models/automation/WhatsAppConversation';
import Lead from '../../../../../models/automation/Lead';
import { withPermissions } from '../../../../../lib/rbac';

/**
 * GET /api/automation/chat/conversations
 * Fetch list of conversations for the current business
 */
async function handler(req) {
  try {
    const { user } = req;
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status'); // 'unread', 'read', or null for all
    const search = escapeRegex(searchParams.get('search') || '').slice(0, 200); // search by name or number
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    await dbConnect();

    // 2. Build Query
    let conversations = [];
    let total = 0;

    if (status === 'unread' || status === 'read') {
      const query = { businessId: user.businessId, isArchived: false, status };
      
      if (search) {
        const leads = await Lead.find({
          businessId: user.businessId,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        query.leadId = { $in: leads.map(l => l._id) };
      }

      conversations = await WhatsAppConversation.find(query)
        .populate('leadId', 'name phone whatsappId email status')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await WhatsAppConversation.countDocuments(query);
    } else {
      // "All" tab - show all leads
      const leadQuery = { businessId: user.businessId };
      if (search) {
        leadQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      const leads = await Lead.find(leadQuery)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Lead.countDocuments(leadQuery);

      // Merge with conversation data
      conversations = await Promise.all(leads.map(async (lead) => {
        const conv = await WhatsAppConversation.findOne({ leadId: lead._id, businessId: user.businessId })
          .populate('assignedTo', 'firstName lastName email')
          .lean();

        if (conv) {
          return { ...conv, leadId: lead };
        }

        return {
          _id: `temp_${lead._id}`,
          leadId: lead,
          businessId: user.businessId,
          status: 'read',
          unreadCount: 0,
          lastMessagePreview: 'New conversation',
          lastMessageAt: lead.updatedAt,
          isNew: true
        };
      }));
    }

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('[Chat API] Error fetching conversations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// Only users with dashboard and reports access can access
export const GET = withPermissions(['dashboard_access', 'reports_access'], handler);
