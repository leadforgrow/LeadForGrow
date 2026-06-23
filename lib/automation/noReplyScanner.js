/**
 * No-response detection — scans idle conversations/leads and fires automation events.
 */
import Lead from '@/models/automation/Lead';
import Conversation from '@/models/omnichannel/Conversation';
import { dispatchAutomationEvent } from '@/lib/automation/triggerHub';

function msFromConfig(config = {}) {
  const minutes = config.noReplyMinutes ?? config.minutes;
  const hours = config.noReplyHours ?? config.hours ?? config.timeoutHours;
  const days = config.noReplyDays ?? config.days;
  if (minutes) return minutes * 60000;
  if (hours) return hours * 3600000;
  if (days) return days * 86400000;
  return (config.defaultHours || 48) * 3600000;
}

export async function scanNoReplyLeads(businessId, options = {}) {
  const thresholdMs = msFromConfig(options);
  const cutoff = new Date(Date.now() - thresholdMs);
  const contextType = options.contextType || 'general';
  const results = [];

  const conversations = await Conversation.find({
    businessId,
    lastMessageDirection: 'outgoing',
    lastMessageAt: { $lte: cutoff },
    status: { $ne: 'closed' },
    isArchived: { $ne: true },
  }).limit(200).lean();

  for (const conv of conversations) {
    if (!conv.leadId) continue;
    const lead = await Lead.findById(conv.leadId);
    if (!lead || lead.archived) continue;

    const meta = lead.metadata || {};
    const lastNoReply = meta.lastNoReplyAt ? new Date(meta.lastNoReplyAt) : null;
    if (lastNoReply && Date.now() - lastNoReply < thresholdMs) continue;

    await dispatchAutomationEvent(lead, 'no_reply', {
      contextType,
      channel: conv.channel,
      conversationId: conv._id,
      idleSince: conv.lastMessageAt,
      thresholdMs,
    });

    await Lead.updateOne(
      { _id: lead._id },
      { $set: { 'metadata.lastNoReplyAt': new Date(), 'metadata.noReplyContext': contextType } }
    );

    results.push({ leadId: lead._id, conversationId: conv._id, channel: conv.channel });
  }

  return { scanned: conversations.length, triggered: results.length, results };
}

export async function scanAllBusinessesNoReply() {
  const Business = (await import('@/models/Business')).default;
  const businesses = await Business.find({ status: 'active' }).select('_id settings').lean();
  const summary = [];

  for (const biz of businesses) {
    const cfg = biz.settings?.automation?.noReply || {};
    if (cfg.enabled === false) continue;
    const hours = cfg.hours ?? cfg.defaultHours ?? 48;
    const r = await scanNoReplyLeads(biz._id, { ...cfg, defaultHours: hours });
    if (r.triggered) summary.push({ businessId: biz._id, ...r });
  }

  return summary;
}
