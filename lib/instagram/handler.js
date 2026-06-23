/**
 * Instagram DM handler — Meta Instagram Messaging API
 */
import { matchCustomer } from '@/lib/omnichannel/customerMatching';
import { recordChannelMessage } from '@/lib/omnichannel/conversationService';
import WebhookLog from '@/models/automation/WebhookLog';

export function parseInstagramMessaging(entry) {
  const events = [];
  for (const item of entry?.messaging || []) {
    const senderId = item.sender?.id;
    const recipientId = item.recipient?.id;
    const timestamp = item.timestamp ? new Date(item.timestamp) : new Date();

    if (item.message) {
      const msg = item.message;
      events.push({
        type: 'message',
        messageId: msg.mid,
        senderId,
        recipientId,
        timestamp,
        text: msg.text,
        attachments: msg.attachments || [],
        isEcho: msg.is_echo,
        replyTo: msg.reply_to?.mid,
        isStoryReply: !!msg.reply_to?.story,
      });
    }

    if (item.read) {
      events.push({ type: 'read', senderId, watermark: item.read.watermark });
    }
  }
  return events;
}

export async function processInstagramEvent(businessId, event) {
  if (event.type !== 'message' || event.isEcho) {
    return { status: 'skipped' };
  }

  const messageId = event.messageId;
  const existing = await WebhookLog.findOne({ webhookId: messageId, status: 'processed' });
  if (existing) return { status: 'skipped', reason: 'duplicate' };

  await WebhookLog.findOneAndUpdate(
    { webhookId: messageId },
    { businessId, webhookId: messageId, payload: event, status: 'pending' },
    { upsert: true }
  );

  const matched = await matchCustomer(businessId, {
    instagramId: event.senderId,
    name: 'Instagram User',
    channel: 'instagram',
    createIfMissing: true,
  });

  const lead = matched.lead;
  if (lead && !lead.metadata?.get?.('instagramId')) {
    lead.metadata = lead.metadata || new Map();
    lead.metadata.set('instagramId', event.senderId);
    await lead.save();
  }

  const attachment = event.attachments?.[0];
  let type = 'text';
  let body = event.text || '';
  if (attachment) {
    type = attachment.type === 'image' ? 'image' : attachment.type === 'video' ? 'video' : 'text';
    body = body || `[${type}]`;
  }
  if (event.isStoryReply) type = 'story_reply';

  const { conversation } = await recordChannelMessage({
    businessId,
    channel: 'instagram',
    leadId: lead._id,
    contactId: matched.contact?._id,
    companyId: matched.company?._id,
    dealId: matched.deal?._id,
    messageId,
    direction: 'incoming',
    type,
    content: {
      body,
      participantId: event.senderId,
      mediaUrl: attachment?.payload?.url,
    },
    timestamp: event.timestamp,
    rawMetadata: event,
  });

  await WebhookLog.findOneAndUpdate({ webhookId: messageId }, { status: 'processed' });

  if (lead?._id) {
    try {
      const { dispatchAutomationEvent } = await import('@/lib/automation/triggerHub');
      const { resumeWaitingExecutions } = await import('@/lib/automation/workflowResume');
      await dispatchAutomationEvent(lead, 'instagram_dm', { conversationId: conversation._id, messageId });
      await resumeWaitingExecutions(lead._id, 'reply');
    } catch (err) {
      console.error('[Instagram] Automation dispatch error:', err.message);
    }
  }

  return { status: 'success', leadId: lead._id, conversationId: conversation._id };
}

export default { parseInstagramMessaging, processInstagramEvent };
