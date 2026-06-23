import Conversation from '@/models/omnichannel/Conversation';
import WhatsAppConversation from '@/models/automation/WhatsAppConversation';
import Message from '@/models/automation/Message';
import Activity from '@/models/automation/Activity';
import { MESSAGE_ACTIVITY_MAP } from '@/lib/omnichannel/constants';
import { emitChatMessage, emitChatRead, emitDashboardMetrics } from '@/lib/realtime/publish';
import { notifyInboxMessage, notifyConversationAssigned } from '@/lib/omnichannel/notifications';

function previewFromMessage({ type, body, subject, isInternal }) {
  if (isInternal) return `📝 ${body?.substring(0, 80) || 'Internal note'}`;
  if (type === 'image') return '📷 Image';
  if (type === 'video') return '🎥 Video';
  if (type === 'audio') return '🎤 Audio';
  if (type === 'document') return '📎 Document';
  if (type === 'email' && subject) return subject.substring(0, 100);
  return body?.substring(0, 100) || 'New message';
}

/**
 * Migrate legacy WhatsAppConversation rows into unified Conversation (lazy).
 */
export async function syncLegacyWhatsAppConversations(businessId) {
  const legacy = await WhatsAppConversation.find({ businessId }).lean();
  for (const row of legacy) {
    const exists = await Conversation.findOne({ businessId, channel: 'whatsapp', leadId: row.leadId });
    if (exists) continue;
    await Conversation.create({
      businessId,
      channel: 'whatsapp',
      leadId: row.leadId,
      assignedTo: row.assignedTo,
      inboxStatus: row.status || 'read',
      unreadCount: row.unreadCount || 0,
      lastMessageAt: row.lastMessageAt,
      lastMessagePreview: row.lastMessagePreview,
      lastMessageDirection: row.lastMessageDirection,
      isArchived: row.isArchived || false,
      participantId: String(row.leadId),
    });
  }
}

export async function upsertConversation(businessId, {
  channel,
  leadId,
  contactId,
  companyId,
  dealId,
  participantId,
  participantName,
  participantEmail,
  participantPhone,
  assignedTo,
  direction = 'incoming',
  preview,
  timestamp = new Date(),
  incrementUnread = false,
  inboxStatus,
}) {
  const update = {
    leadId,
    contactId,
    companyId,
    dealId,
    participantName,
    participantEmail,
    participantPhone,
    lastMessageAt: timestamp,
    lastMessagePreview: preview,
    lastMessageDirection: direction,
  };
  if (assignedTo) update.assignedTo = assignedTo;
  if (inboxStatus) update.inboxStatus = inboxStatus;

  const inc = incrementUnread ? { unreadCount: 1 } : {};

  const conversation = await Conversation.findOneAndUpdate(
    { businessId, channel, participantId: participantId || String(leadId) },
    {
      $set: update,
      $setOnInsert: { businessId, channel, participantId: participantId || String(leadId), status: 'open' },
      ...(incrementUnread ? { $inc: inc } : {}),
    },
    { upsert: true, new: true }
  );

  // Keep legacy WhatsAppConversation in sync for backward compat
  if (channel === 'whatsapp' && leadId) {
    await WhatsAppConversation.findOneAndUpdate(
      { businessId, leadId },
      {
        $set: {
          lastMessageAt: timestamp,
          lastMessagePreview: preview,
          lastMessageDirection: direction,
          ...(inboxStatus ? { status: inboxStatus } : {}),
        },
        ...(incrementUnread ? { $inc: { unreadCount: 1 } } : {}),
      },
      { upsert: true }
    );
  }

  return conversation;
}

export async function recordChannelMessage({
  businessId,
  channel,
  leadId,
  contactId,
  companyId,
  dealId,
  conversationId,
  messageId,
  direction,
  type = 'text',
  content = {},
  timestamp = new Date(),
  status = 'received',
  isInternal = false,
  performedBy,
  subject,
  emailThreadId,
  rawMetadata,
}) {
  const body = content.body || content.text || '';
  const preview = previewFromMessage({ type, body, subject, isInternal });

  let conversation = conversationId
    ? await Conversation.findById(conversationId)
    : null;

  if (!conversation) {
    conversation = await upsertConversation(businessId, {
      channel,
      leadId,
      contactId,
      companyId,
      dealId,
      participantId: content.participantId,
      participantName: content.participantName,
      participantEmail: content.participantEmail,
      participantPhone: content.participantPhone,
      direction,
      preview,
      timestamp,
      incrementUnread: direction === 'incoming' && !isInternal,
      inboxStatus: direction === 'incoming' && !isInternal ? 'unread' : undefined,
    });
  } else {
    await Conversation.findByIdAndUpdate(conversation._id, {
      $set: {
        lastMessageAt: timestamp,
        lastMessagePreview: preview,
        lastMessageDirection: direction,
        ...(direction === 'incoming' && !isInternal ? { inboxStatus: 'unread' } : {}),
      },
      ...(direction === 'incoming' && !isInternal ? { $inc: { unreadCount: 1 } } : {}),
    });
  }

  const message = await Message.create({
    businessId,
    leadId,
    conversationId: conversation._id,
    channel,
    contactId: contactId || conversation.contactId,
    companyId: companyId || conversation.companyId,
    dealId: dealId || conversation.dealId,
    messageId,
    direction,
    type,
    content,
    timestamp,
    status,
    isInternal,
    subject,
    emailThreadId,
    rawMetadata,
  });

  if (!isInternal) {
    const activityType = MESSAGE_ACTIVITY_MAP[channel]?.[direction === 'incoming' ? 'incoming' : 'outgoing'];
    if (activityType) {
      await Activity.create({
        businessId,
        leadId,
        contactId: contactId || conversation.contactId,
        entityType: 'lead',
        entityId: leadId,
        type: activityType,
        description: `${channel} ${direction === 'incoming' ? 'received' : 'sent'}: "${preview}"`,
        performedBy,
        metadata: { messageId, channel, conversationId: conversation._id },
      });
    }

    await emitChatMessage(businessId, {
      leadId,
      conversationId: conversation._id,
      channel,
      messageId: message._id,
      direction,
    });
    await emitDashboardMetrics(businessId, { type: 'inbox_update' });

    if (direction === 'incoming' && !isInternal) {
      const Lead = (await import('@/models/automation/Lead')).default;
      const lead = await Lead.findById(leadId).select('name').lean();
      await notifyInboxMessage({
        businessId,
        lead,
        channel,
        preview,
        conversationId: conversation._id,
        leadId,
      });
    }
  }

  return { message, conversation };
}

export async function markConversationRead(conversationId, businessId) {
  const conv = await Conversation.findOneAndUpdate(
    { _id: conversationId, businessId },
    { $set: { unreadCount: 0, inboxStatus: 'read' } },
    { new: true }
  );
  if (conv?.channel === 'whatsapp' && conv.leadId) {
    await WhatsAppConversation.findOneAndUpdate(
      { businessId, leadId: conv.leadId },
      { $set: { unreadCount: 0, status: 'read' } }
    );
  }
  await emitChatRead(businessId, { conversationId, leadId: conv?.leadId });
  return conv;
}

export async function assignConversation(conversationId, businessId, { toUserId, fromUserId, assignedBy, reason }) {
  const conv = await Conversation.findOne({ _id: conversationId, businessId });
  if (!conv) throw new Error('Conversation not found');

  const historyEntry = {
    fromUser: fromUserId || conv.assignedTo,
    toUser: toUserId,
    assignedBy,
    reason,
    assignedAt: new Date(),
  };

  conv.assignedTo = toUserId;
  conv.assignmentHistory.push(historyEntry);
  await conv.save();

  if (conv.channel === 'whatsapp' && conv.leadId) {
    await WhatsAppConversation.findOneAndUpdate(
      { businessId, leadId: conv.leadId },
      { $set: { assignedTo: toUserId } },
      { upsert: true }
    );
  }

  await Activity.create({
    businessId,
    leadId: conv.leadId,
    entityType: 'lead',
    entityId: conv.leadId,
    type: 'conversation_assigned',
    description: `Conversation assigned`,
    performedBy: assignedBy,
    metadata: { conversationId, toUserId, channel: conv.channel },
  });

  if (toUserId) {
    await notifyConversationAssigned({
      businessId,
      toUserId,
      conversationId,
      channel: conv.channel,
      assignedBy,
    });
  }

  return conv;
}

export default {
  syncLegacyWhatsAppConversations,
  upsertConversation,
  recordChannelMessage,
  markConversationRead,
  assignConversation,
};
