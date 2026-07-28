import Lead from '../../models/automation/Lead';
import WebhookLog from '../../models/automation/WebhookLog';
import Activity from '../../models/automation/Activity';
import Business from '../../models/Business';
import User from '../../models/User';
import Notification from '../../models/automation/Notification';
import { automationEngine } from './engine';
import { sendAutoWhatsApp } from '../integrations/whatsapp';
import { matchCustomer } from '../omnichannel/customerMatching';
import { recordChannelMessage } from '../omnichannel/conversationService';

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

      const matched = await matchCustomer(businessId, {
        phone: senderId,
        name: senderName,
        channel: 'whatsapp',
        createIfMissing: true,
      });
      const lead = matched.lead;
      const isNewLead = matched.isNew;

      if (!lead) {
        throw new Error('Failed to resolve lead for incoming message');
      }

      // Update lead fields from inbound
      await Lead.findByIdAndUpdate(lead._id, {
        $set: {
          name: senderName || lead.name,
          whatsappId: senderId,
          phone: lead.phone || senderId,
          lastContactedAt: timestamp,
          ...(attributionData.adId ? {
            adId: attributionData.adId,
            adHeadline: attributionData.adHeadline,
            adSourceType: attributionData.adSourceType,
            referralData: attributionData.referralData,
          } : {}),
        },
        ...(isNewLead && attributionData.source ? { $setOnInsert: { source: attributionData.source } } : {}),
      });

      // 3. Trigger Automations (Async - do not block lead ingestion)
      if (isNewLead || referral) {
        try {
          const trigger = automationEngine.triggerForNewLead ?? (await import('./engine')).triggerForNewLead;
          if (typeof trigger === 'function') {
            trigger(lead, businessId).catch((err) => {
              console.error('[LeadManager] Automation Trigger Error:', err);
            });
          } else {
            automationEngine.processLeadTrigger(lead, 'onLeadReceived').catch((err) => {
              console.error('[LeadManager] Automation Trigger Error:', err);
            });
          }
        } catch (triggerErr) {
          console.error('[LeadManager] Automation Trigger Error:', triggerErr);
        }
      }

      // 4. Store Message + unified conversation + realtime
      const recorded = await recordChannelMessage({
        businessId,
        channel: 'whatsapp',
        leadId: lead._id,
        contactId: matched.contact?._id,
        companyId: matched.company?._id,
        dealId: matched.deal?._id,
        messageId,
        direction: 'incoming',
        type,
        content: {
          body,
          caption: raw.caption,
          fileName: parsedData.fileName,
          mimeType: parsedData.mimeType,
          mediaId: parsedData.mediaId,
          participantId: senderId,
          participantPhone: senderId,
          participantName: senderName,
        },
        timestamp,
        rawMetadata: raw,
      });

      // 5. Notify Owner/Assignee
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

      try {
        const { dispatchAutomationEvent } = await import('./triggerHub');
        const { resumeWaitingExecutions } = await import('./workflowResume');
        await dispatchAutomationEvent(lead, 'whatsapp_message', {
          conversationId: recorded?.conversation?._id,
          messageId,
        });
        await resumeWaitingExecutions(lead._id, 'reply');

        // WhatsApp Flow Builder — resume waits then match new triggers
        const business = await Business.findById(businessId);
        let flowHandled = false;
        if (business) {
          const {
            resumeFlowWaitForReply,
            matchAndStartFlows,
          } = await import('@/lib/whatsappFlows/engine');
          const resumed = await resumeFlowWaitForReply({
            businessId,
            leadId: lead._id,
            text: body,
            buttonId: parsedData.buttonId,
            listId: parsedData.listId,
          });
          const started = await matchAndStartFlows({
            business,
            lead,
            text: body,
            conversationId: recorded?.conversation?._id,
            event: 'incoming_message',
          });
          flowHandled = (resumed?.length > 0) || (started?.length > 0);
        }

        // WhatsApp AI Agent — auto-reply from knowledge base when enabled.
        // Skipped if a flow handled the message or a human has taken over.
        const aiSettings = business?.settings?.ai;
        const conv = recorded?.conversation;
        const intervened = conv?.inboxStatus === 'intervened' || conv?.status === 'intervened';
        if (
          business &&
          !flowHandled &&
          !intervened &&
          body?.trim() &&
          aiSettings?.enabled !== false &&
          aiSettings?.whatsappAutoReply === true
        ) {
          try {
            const { runSalesAgent } = await import('@/lib/ai/agent');
            const Message = (await import('../../models/automation/Message')).default;
            const history = await Message.find({ businessId, leadId: lead._id })
              .sort({ timestamp: -1 })
              .limit(10)
              .lean();
            history.reverse();

            const ai = await runSalesAgent({
              businessId,
              businessName: business.businessName || 'us',
              message: body,
              leadId: lead._id,
              conversationHistory: history,
              channel: 'whatsapp',
            });

            if (ai?.reply) {
              await sendAutoWhatsApp(lead, business, ai.reply);
              console.log(`[LeadManager] AI agent auto-replied (confidence=${ai.confidence}, handoff=${ai.handoff})`);
            }
          } catch (aiErr) {
            console.error('[LeadManager] AI auto-reply error:', aiErr.message);
          }
        }
      } catch (autoErr) {
        console.error('[LeadManager] Automation dispatch error:', autoErr.message);
      }

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

    const { metaLog, metaWarn, metaError } = await import('@/lib/meta/logger');

    metaLog('LeadManager', 'processMetaLead called', {
      businessId: String(businessId),
      metaLeadId,
      name,
      email,
      phone,
      campaignName,
      adSetName,
      adName,
      formId,
      receivedAt,
      fieldKeys: fields ? Object.keys(fields) : []
    });

    try {
      metaLog('LeadManager', `Checking duplicate metaLeadId=${metaLeadId}`);
      const existingLead = await Lead.findOne({ businessId, metaLeadId });
      if (existingLead) {
        metaWarn('LeadManager', `Duplicate lead skipped — existingId=${existingLead._id}`);
        return { status: 'skipped', reason: 'already_processed', leadId: existingLead._id };
      }

      metaLog('LeadManager', 'Creating lead in database', { metaLeadId, name, email, phone });
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
      metaLog('LeadManager', 'Lead created in database', {
        leadId: lead._id.toString(),
        metaLeadId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone
      });

      // Post-save steps are non-critical — never fail ingestion if these error
      try {
        const trigger = automationEngine.triggerForNewLead ?? (await import('./engine')).triggerForNewLead;
        if (typeof trigger === 'function') {
          trigger(lead, businessId).catch((err) => {
            metaWarn('LeadManager', 'Automation trigger failed (non-critical)', err.message);
          });
        } else {
          await automationEngine.processLeadTrigger(lead, 'onLeadReceived').catch((err) => {
            metaWarn('LeadManager', 'processLeadTrigger failed (non-critical)', err.message);
          });
        }
      } catch (triggerErr) {
        metaWarn('LeadManager', 'Automation trigger failed (non-critical)', triggerErr.message);
      }

      await Activity.create({
        businessId,
        leadId: lead._id,
        type: 'meta_lead_received',
        description: `New lead from Meta Ads: ${campaignName} / ${adName}`,
        metadata: { metaLeadId, campaignName, adName, formId }
      }).catch((e) => metaWarn('LeadManager', 'Activity create failed (non-critical)', e.message));

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
        }).catch((e) => metaWarn('LeadManager', 'Notification create failed (non-critical)', e.message));
      } else {
        metaWarn('LeadManager', 'No ownerId on business — skipping notification');
      }

      metaLog('LeadManager', 'processMetaLead COMPLETE', { leadId: lead._id.toString(), status: 'success' });
      return { status: 'success', leadId: lead._id };

    } catch (error) {
      metaError('LeadManager', 'processMetaLead FATAL', error);
      throw error;
    }
  }
};
