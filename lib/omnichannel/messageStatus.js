import Message from '@/models/automation/Message';
import { emitChatMessageStatus } from '@/lib/realtime/publish';

const STATUS_MAP = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
};

/**
 * Process WhatsApp Cloud API message status webhooks.
 */
export async function processWhatsAppStatuses(businessId, statuses = []) {
  const results = [];

  for (const entry of statuses) {
    const externalId = entry.id;
    const mapped = STATUS_MAP[entry.status];
    if (!externalId || !mapped) continue;

    const message = await Message.findOneAndUpdate(
      { businessId, messageId: externalId },
      {
        $set: {
          status: mapped,
          ...(entry.timestamp ? { 'rawMetadata.lastStatusAt': new Date(parseInt(entry.timestamp, 10) * 1000) } : {}),
        },
      },
      { new: true }
    );

    if (message) {
      await emitChatMessageStatus(businessId, {
        messageId: message._id,
        externalMessageId: externalId,
        status: mapped,
        leadId: message.leadId,
        conversationId: message.conversationId,
      });
      results.push({ messageId: externalId, status: mapped, updated: true });
    } else {
      results.push({ messageId: externalId, status: mapped, updated: false });
    }
  }

  return results;
}

export default { processWhatsAppStatuses };
