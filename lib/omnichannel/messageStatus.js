import Message from '@/models/automation/Message';
import Activity from '@/models/automation/Activity';
import Broadcast from '@/models/automation/Broadcast';
import { emitChatMessageStatus } from '@/lib/realtime/publish';

const STATUS_MAP = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
};

function extractStatusError(entry) {
  const err = entry?.errors?.[0];
  if (!err) return null;
  return {
    code: err.code,
    title: err.title,
    message: err.message,
    details: err.error_data?.details || err.message || err.title,
  };
}

/**
 * Process WhatsApp Cloud API message status webhooks.
 */
export async function processWhatsAppStatuses(businessId, statuses = []) {
  const results = [];

  for (const entry of statuses) {
    const externalId = entry.id;
    const mapped = STATUS_MAP[entry.status];
    if (!externalId || !mapped) continue;

    const statusError = extractStatusError(entry);
    const update = {
      status: mapped,
      ...(entry.timestamp
        ? { 'rawMetadata.lastStatusAt': new Date(parseInt(entry.timestamp, 10) * 1000) }
        : {}),
      ...(statusError ? { 'rawMetadata.deliveryError': statusError } : {}),
    };

    // Update all copies (chat + inbox can record the same wamid twice)
    await Message.updateMany(
      { businessId, messageId: externalId },
      { $set: update }
    );

    // Also update matching Broadcast recipient so the broadcast detail view
    // shows real delivery/read/failed status per recipient, not just "sent".
    try {
      const recipientUpdate = { 'recipients.$.status': mapped };
      if (mapped === 'delivered') recipientUpdate['recipients.$.deliveredAt'] = new Date();
      if (mapped === 'read') recipientUpdate['recipients.$.readAt'] = new Date();
      if (mapped === 'failed') {
        recipientUpdate['recipients.$.failedAt'] = new Date();
        if (statusError) {
          recipientUpdate['recipients.$.error'] = statusError.details;
          recipientUpdate['recipients.$.failureCode'] = String(statusError.code || '');
          recipientUpdate['recipients.$.failureTitle'] = statusError.title || '';
        }
      }
      await Broadcast.updateMany(
        { businessId, 'recipients.metaMessageId': externalId },
        { $set: recipientUpdate }
      );

      // Increment the roll-up analytics counter once per status flip
      if (mapped === 'delivered' || mapped === 'read' || mapped === 'failed') {
        const counterField = `analytics.${mapped}`;
        await Broadcast.updateMany(
          { businessId, 'recipients.metaMessageId': externalId },
          { $inc: { [counterField]: 1 } }
        );
      }
    } catch (broadcastErr) {
      console.warn('[messageStatus] broadcast recipient update failed:', broadcastErr.message);
    }

    const message = await Message.findOne({ businessId, messageId: externalId }).lean();

    if (message) {
      await emitChatMessageStatus(businessId, {
        messageId: message._id,
        externalMessageId: externalId,
        status: mapped,
        leadId: message.leadId,
        conversationId: message.conversationId,
        error: statusError,
      });

      if (mapped === 'failed' && statusError && message.leadId) {
        try {
          await Activity.create({
            businessId,
            leadId: message.leadId,
            entityType: 'lead',
            entityId: message.leadId,
            type: 'whatsapp_failed',
            description: `WhatsApp delivery failed: ${statusError.details}`,
            metadata: {
              messageId: externalId,
              code: statusError.code,
              title: statusError.title,
            },
          });
        } catch (activityErr) {
          console.warn('[WhatsApp] Failed to log delivery error activity:', activityErr.message);
        }
      }

      results.push({ messageId: externalId, status: mapped, updated: true, error: statusError });
    } else {
      results.push({ messageId: externalId, status: mapped, updated: false, error: statusError });
    }
  }

  return results;
}

export default { processWhatsAppStatuses };
