import Lead from '@/models/automation/Lead';
import Deal from '@/models/automation/Deal';
import Conversation from '@/models/omnichannel/Conversation';
import Task from '@/models/automation/Task';
import MeetingBooking from '@/models/meetings/MeetingBooking';
import { formatCurrency } from '@/lib/server/businessAssistantContext';

/**
 * Secure CRM tool execution for Grovia copilot — read-only queries scoped to businessId.
 */
export async function executeCopilotTool(tool, params, businessId) {
  switch (tool) {
    case 'hot_leads': {
      const leads = await Lead.find({
        businessId,
        archived: { $ne: true },
        $or: [{ priority: { $in: ['high', 'urgent'] } }, { status: 'new' }],
      })
        .sort({ createdAt: -1 })
        .limit(params.limit || 10)
        .select('name phone email status priority source')
        .lean();
      return { tool, count: leads.length, data: leads };
    }

    case 'deals_above': {
      const min = Number(params.amount) || 50000;
      const deals = await Deal.find({ businessId, amount: { $gte: min }, stage: { $nin: ['won', 'lost'] } })
        .sort({ amount: -1 })
        .limit(10)
        .lean();
      return { tool, count: deals.length, data: deals };
    }

    case 'waiting_customers': {
      const convs = await Conversation.find({ businessId, inboxStatus: 'unread', isDeleted: { $ne: true } })
        .populate('leadId', 'name phone')
        .sort({ lastMessageAt: -1 })
        .limit(10)
        .lean();
      return { tool, count: convs.length, data: convs.map((c) => ({ name: c.leadId?.name, channel: c.channel, preview: c.lastMessagePreview })) };
    }

    case 'create_meeting': {
      if (!params.leadId) return { tool, error: 'leadId required' };
      const meeting = await MeetingBooking.create({
        businessId,
        leadId: params.leadId,
        title: params.title || 'Follow-up call',
        startTime: params.startTime ? new Date(params.startTime) : new Date(Date.now() + 86400000),
        endTime: params.endTime ? new Date(params.endTime) : new Date(Date.now() + 86400000 + 3600000),
        status: 'scheduled',
      });
      return { tool, success: true, meeting };
    }

    case 'pipeline_summary': {
      const deals = await Deal.find({ businessId, stage: { $nin: ['won', 'lost'] } }).lean();
      const total = deals.reduce((s, d) => s + (Number(d.amount) || 0), 0);
      return { tool, dealCount: deals.length, pipelineValue: formatCurrency(total), deals: deals.slice(0, 5) };
    }

    default:
      return { tool, error: 'Unknown tool' };
  }
}

export function detectCopilotIntent(question) {
  const q = question.toLowerCase();
  if (/hot lead|priority lead|call today|who should i call/.test(q)) return { tool: 'hot_leads', params: {} };
  if (/deal.*above|₹\s*[\d,]+|pipeline.*\d/.test(q)) {
    const match = q.match(/[\d,]+/);
    return { tool: 'deals_above', params: { amount: match ? parseInt(match[0].replace(/,/g, ''), 10) : 50000 } };
  }
  if (/waiting|unread|customer.*wait|pending.*reply/.test(q)) return { tool: 'waiting_customers', params: {} };
  if (/create meeting|schedule meeting|book meeting/.test(q)) return { tool: 'create_meeting', params: { title: 'Follow-up meeting' } };
  if (/pipeline|deals summary/.test(q)) return { tool: 'pipeline_summary', params: {} };
  return null;
}

export default { executeCopilotTool, detectCopilotIntent };
