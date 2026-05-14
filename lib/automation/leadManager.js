import Lead from '../../models/automation/Lead';
import Message from '../../models/automation/Message';
import WebhookLog from '../../models/automation/WebhookLog';
import Activity from '../../models/automation/Activity';
import Business from '../../models/Business';
import User from '../../models/User';
import Notification from '../../models/automation/Notification';
import WhatsAppConversation from '../../models/automation/WhatsAppConversation';
import { automationEngine } from './engine';
import { sendAutoWhatsApp } from '../integrations/whatsapp';

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
      // 0. Filter Noise (OTP/System Messages)
      const noisePatterns = [
        /\b[0-9]{4,8}\b.*code/i,
        /verification code/i,
        /otp/i,
        /instagram code/i,
        /facebook code/i,
        /whatsapp code/i
      ];

      const isNoise = body && noisePatterns.some(pattern => pattern.test(body));
      if (isNoise) {
        console.log(`[LeadManager] Filtering system noise/OTP: "${body}"`);
        return { status: 'skipped', reason: 'system_noise' };
      }

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

      // 5. Update Conversation State
      await WhatsAppConversation.findOneAndUpdate(
        { businessId, leadId: lead._id },
        {
          $set: {
            lastMessageAt: timestamp,
            lastMessagePreview: body?.substring(0, 100),
            lastMessageDirection: 'incoming',
            status: 'unread'
          },
          $inc: { unreadCount: 1 }
        },
        { upsert: true, new: true }
      );

      // 6. Create Activity Record
      await Activity.create({
        businessId,
        leadId: lead._id,
        type: 'whatsapp_received',
        description: `Received WhatsApp message: "${body?.substring(0, 50)}${body?.length > 50 ? '...' : ''}"`,
        metadata: { messageId, body }
      });

      // 6. Notify Owner/Assignee (Sitting anywhere notification)
      try {
        const business = await Business.findById(businessId);
        const notificationSettings = business?.settings?.notifications?.whatsapp;

        if (notificationSettings?.enabled) {
          // Determine recipients: assignee first, then owner, then default recipients
          const recipients = new Set(notificationSettings.recipients || []);
          
          if (lead.assignedTo) {
            const assignee = await User.findById(lead.assignedTo);
            if (assignee?.phone) recipients.add(assignee.phone);
          } else {
            const owner = await User.findById(business.ownerId);
            if (owner?.phone) recipients.add(owner.phone);
          }

          const alertMessage = `🔔 *New Message from ${lead.name}*\n\n"${body}"\n\nReply here: https://lfg-v2.vercel.app/automation/leads/${lead._id}`;
          
          // Create In-App Notification
          const targetUserId = lead.assignedTo || business.ownerId;
          if (targetUserId) {
            await Notification.create({
              businessId,
              userId: targetUserId,
              type: 'whatsapp_message',
              title: `New Message from ${lead.name}`,
              message: body,
              link: `/automation/leads/${lead._id}`,
              metadata: { leadId: lead._id, messageId }
            }).catch(e => console.error('[LeadManager] In-App Notification Error:', e.message));
          }

          for (const recipientPhone of recipients) {
            if (!recipientPhone) continue;
            // We use the same WhatsApp engine to notify the team
            // Note: This requires the recipient phone to be in the same WhatsApp window or using a template.
            // For now, we'll try free-form text.
            await sendAutoWhatsApp({ phone: recipientPhone, name: 'Team Member' }, business, alertMessage).catch(e => {
              console.error(`[LeadManager] Failed to notify recipient ${recipientPhone}:`, e.message);
            });
          }
        }
      } catch (notifyError) {
        console.error('[LeadManager] Notification Error:', notifyError);
      }

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
  },

  /**
   * Processes a Meta Lead Ads lead
   */
  async processMetaLead(businessId, leadData) {
    const {
      metaLeadId,
      name,
      email,
      phone,
      campaignName,
      adSetName,
      adName,
      formId,
      receivedAt,
      fields
    } = leadData;

    console.log(`[LeadManager] 📥 processMetaLead called`);
    console.log(`[LeadManager]   businessId : ${businessId}`);
    console.log(`[LeadManager]   metaLeadId : ${metaLeadId}`);
    console.log(`[LeadManager]   name       : ${name}`);
    console.log(`[LeadManager]   email      : ${email}`);
    console.log(`[LeadManager]   phone      : ${phone}`);
    console.log(`[LeadManager]   campaign   : ${campaignName}`);

    try {
      // 1. Idempotency Check — prevent duplicate leads
      console.log(`[LeadManager] 🔍 Checking for existing lead with metaLeadId: ${metaLeadId}`);
      const existingLead = await Lead.findOne({ businessId, metaLeadId });
      if (existingLead) {
        console.log(`[LeadManager] ⚠️ Duplicate — lead already exists: ${existingLead._id}`);
        return { status: 'skipped', reason: 'already_processed', leadId: existingLead._id };
      }
      console.log(`[LeadManager] ✅ No duplicate found — proceeding to create lead`);

      // 2. Create Lead in DB
      console.log(`[LeadManager] 💾 Creating lead in database...`);
      const lead = await Lead.create({
        businessId,
        name,
        email,
        phone,
        source: 'meta_ads',
        sourceDetails: `Meta Ads: ${campaignName}`,
        metaLeadId,
        campaignName,
        adSetName,
        adName,
        formId,
        receivedAt: new Date(receivedAt),
        status: 'new',
        adSourceType: 'lead_gen',
        metadata: fields
      });
      console.log(`[LeadManager] ✅ Lead created successfully! ID: ${lead._id}`);

      // 3. Trigger Automations (non-blocking)
      automationEngine.triggerForNewLead(lead, businessId).catch(err => {
        console.error('[LeadManager] ⚠️ Automation trigger failed (non-critical):', err.message);
      });

      // 4. Create Activity Record
      console.log(`[LeadManager] 📝 Creating activity record...`);
      await Activity.create({
        businessId,
        leadId: lead._id,
        type: 'meta_lead_received',
        description: `New lead from Meta Ads: ${campaignName} / ${adName}`,
        metadata: { metaLeadId, campaignName, adName, formId }
      }).catch(e => console.error('[LeadManager] Activity Error (non-critical):', e.message));

      // 5. In-App Notification
      console.log(`[LeadManager] 🔔 Creating in-app notification...`);
      const business = await Business.findById(businessId);
      const targetUserId = business?.ownerId;
      if (targetUserId) {
        await Notification.create({
          businessId,
          userId: targetUserId,
          type: 'new_lead',
          title: `New Meta Ad Lead: ${name}`,
          message: `From ${campaignName} - ${adName}`,
          link: `/automation/leads/${lead._id}`,
          metadata: { leadId: lead._id, metaLeadId }
        }).catch(e => console.error('[LeadManager] Notification Error (non-critical):', e.message));
      } else {
        console.warn('[LeadManager] ⚠️ No ownerId found on business — skipping notification');
      }

      console.log(`[LeadManager] 🎉 processMetaLead COMPLETE — leadId: ${lead._id}`);
      return { status: 'success', leadId: lead._id };

    } catch (error) {
      console.error('[LeadManager] 🔥 FATAL in processMetaLead:', error.message);
      console.error('[LeadManager] Stack:', error.stack);
      throw error;
    }
  }
};
