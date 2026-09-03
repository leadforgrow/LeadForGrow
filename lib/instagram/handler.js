/**
 * Instagram handler — Meta Instagram Messaging + Comments API
 *
 * Meta sends two shapes on the same webhook:
 *   entry.messaging[]   → DMs (this file's original scope)
 *   entry.changes[]     → post comments (added for Instagram Phase 1)
 *
 * Comments are stored as their own conversation per commenter, keyed by
 * `participantId: "ig_comment:<commenterId>"`, so a person's DMs and their
 * public comments never merge into one thread — different contexts need
 * different reply endpoints (DM → /messages, comment → /{id}/replies).
 */
import { matchCustomer } from '@/lib/omnichannel/customerMatching';
import { recordChannelMessage } from '@/lib/omnichannel/conversationService';
import Conversation from '@/models/omnichannel/Conversation';
import WebhookLog from '@/models/automation/WebhookLog';

export const IG_COMMENT_PARTICIPANT_PREFIX = 'ig_comment:';

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

/**
 * Parses `entry.changes[]` from an Instagram webhook payload where
 * `field === 'comments'`. Each element in changes.value is one comment.
 *
 * We ignore echoes (comment.from.id === page id) so our own replies posted
 * back to the post don't loop as new inbound comments.
 */
export function parseInstagramChanges(entry) {
  const events = [];
  const pageId = entry?.id;
  for (const change of entry?.changes || []) {
    if (change.field !== 'comments' || !change.value) continue;
    const v = change.value;
    const commenterId = v.from?.id;
    if (!commenterId || commenterId === pageId) continue;
    events.push({
      type: 'comment',
      commentId: v.id,
      parentCommentId: v.parent_id || null,
      mediaId: v.media?.id || null,
      mediaType: v.media?.media_product_type || null,
      commenterId,
      commenterUsername: v.from?.username || null,
      text: v.text || '',
      timestamp: v.created_time ? new Date(v.created_time * 1000) : new Date(),
    });
  }
  return events;
}

export async function processInstagramCommentEvent(businessId, event) {
  const commentId = event.commentId;
  if (!commentId) return { status: 'skipped', reason: 'missing_comment_id' };

  const existing = await WebhookLog.findOne({ webhookId: commentId, status: 'processed' });
  if (existing) return { status: 'skipped', reason: 'duplicate' };

  await WebhookLog.findOneAndUpdate(
    { webhookId: commentId },
    { businessId, webhookId: commentId, payload: event, status: 'pending' },
    { upsert: true }
  );

  const matched = await matchCustomer(businessId, {
    instagramId: event.commenterId,
    name: event.commenterUsername ? `@${event.commenterUsername}` : 'Instagram User',
    channel: 'instagram',
    createIfMissing: true,
  });
  const lead = matched.lead;
  if (lead && !lead.metadata?.get?.('instagramId')) {
    lead.metadata = lead.metadata || new Map();
    lead.metadata.set('instagramId', event.commenterId);
    if (event.commenterUsername) lead.metadata.set('instagramUsername', event.commenterUsername);
    await lead.save();
  }

  const participantId = `${IG_COMMENT_PARTICIPANT_PREFIX}${event.commenterId}`;

  const { conversation } = await recordChannelMessage({
    businessId,
    channel: 'instagram',
    leadId: lead._id,
    contactId: matched.contact?._id,
    companyId: matched.company?._id,
    dealId: matched.deal?._id,
    messageId: commentId,
    direction: 'incoming',
    type: 'text',
    content: {
      body: event.text,
      participantId,
      instagramCommentId: commentId,
      instagramMediaId: event.mediaId,
      instagramParentCommentId: event.parentCommentId,
      instagramCommenterUsername: event.commenterUsername,
    },
    timestamp: event.timestamp,
    rawMetadata: event,
  });

  // Persist "which comment to reply to next" on the conversation so the
  // composer's Send route can post the reply to the right comment id
  // without walking Messages every time.
  await Conversation.findByIdAndUpdate(conversation._id, {
    $set: {
      'metadata.lastCommentId': commentId,
      'metadata.lastMediaId': event.mediaId,
      'metadata.instagramCommenterUsername': event.commenterUsername,
      participantName:
        conversation.participantName || (event.commenterUsername ? `@${event.commenterUsername}` : undefined),
    },
  });

  await WebhookLog.findOneAndUpdate({ webhookId: commentId }, { status: 'processed' });

  if (lead?._id) {
    try {
      const { dispatchAutomationEvent } = await import('@/lib/automation/triggerHub');
      await dispatchAutomationEvent(lead, 'instagram_comment', {
        conversationId: conversation._id,
        commentId,
        mediaId: event.mediaId,
      });
    } catch (err) {
      console.error('[Instagram] Comment automation dispatch error:', err.message);
    }
  }

  return { status: 'success', leadId: lead._id, conversationId: conversation._id, commentId };
}

export default {
  parseInstagramMessaging,
  processInstagramEvent,
  parseInstagramChanges,
  processInstagramCommentEvent,
  IG_COMMENT_PARTICIPANT_PREFIX,
};
