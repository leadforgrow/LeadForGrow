import Lead from '../../models/automation/Lead';
import Message from '../../models/automation/Message';
import WebhookLog from '../../models/automation/WebhookLog';
import { automationEngine } from './engine';

/**
 * Lead Manager Service - Handles Production Lead Ingestion Logic
 */
export const leadManager = {
  /**
   * Processes a normalized WhatsApp message
   */
  async processIncomingMessage(businessId, parsedData) {
    const {
      messageId,
      senderId,
      senderName,
      body,
      type,
      timestamp,
      referral,
      raw
    } = parsedData;

    try {
      // 1. Idempotency Check (Prevent duplicate processing)
      const existingLog = await WebhookLog.findOne({ webhookId: messageId });
      if (existingLog && existingLog.status === 'processed') {
        return { status: 'skipped', reason: 'already_processed' };
      }

      // Create log if not exists (or update if failed)
      const log = await WebhookLog.findOneAndUpdate(
        { webhookId: messageId },
        {
          businessId,
          webhookId: messageId,
          payload: raw,
          status: 'pending'
        },
        { upsert: true, new: true }
      );

      // 2. Atomic Lead Upsert (Handles Race Conditions)
      const attributionData = referral ? {
        source: referral.sourceType === 'ad' ? (referral.sourceUrl?.includes('instagram') ? 'instagram_ad' : 'facebook_ad') : 'whatsapp',
        adId: referral.adId,
        adHeadline: referral.headline,
        adSourceType: referral.sourceType,
        referralData: referral
      } : {};

      // Smart matching: try full ID or last 10 digits
      let query = {
        businessId,
        $or: [
          { whatsappId: senderId },
          { phone: senderId }
        ]
      };

      if (senderId.length >= 10) {
        const last10 = senderId.slice(-10);
        query.$or.push({ phone: { $regex: last10 + '$' } });
        query.$or.push({ whatsappId: { $regex: last10 + '$' } });
      }

      const upsertResult = await Lead.findOneAndUpdate(
        query,
        {
          $set: {
            businessId,
            name: senderName || 'WhatsApp User',
            whatsappId: senderId,
            phone: senderId,
            lastContactedAt: timestamp,
            adId: attributionData.adId,
            adHeadline: attributionData.adHeadline,
            adSourceType: attributionData.adSourceType,
            referralData: attributionData.referralData
          },
          $setOnInsert: {
            status: 'new',
            receivedAt: timestamp,
            source: attributionData.source || 'whatsapp'
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true }
      );
      
      const lead = upsertResult.value;
      const isNewLead = !upsertResult.lastErrorObject?.updatedExisting;

      // 3. Trigger Automations (Async - do not block lead ingestion)
      if (isNewLead || referral) {
        // Trigger for new leads OR when a recurring lead comes via a new Ad/Referral
        automationEngine.triggerForNewLead(lead, businessId).catch(err => {
          console.error('[LeadManager] Automation Trigger Error:', err);
        });
      }

      // 4. Store Message
      await Message.create({
        businessId,
        leadId: lead._id,
        messageId,
        direction: 'incoming',
        type,
        content: {
          body,
          caption: raw.caption,
          fileName: parsedData.fileName,
          mimeType: parsedData.mimeType,
          mediaId: parsedData.mediaId
        },
        timestamp,
        rawMetadata: raw
      });

      // 4. Mark Log as Processed
      log.status = 'processed';
      await log.save();

      return { status: 'success', leadId: lead._id };
    } catch (error) {
      console.error('[LeadManager] Critical Error:', error);
      // Log the failure
      await WebhookLog.findOneAndUpdate(
        { webhookId: messageId },
        { status: 'failed', error: error.message }
      );
      throw error;
    }
  }
};
