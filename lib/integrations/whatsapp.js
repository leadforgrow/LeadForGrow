import mongoose from 'mongoose';
import { decrypt } from '../encryption';
import { fetchExternal } from '../fetchExternal';

/**
 * Generates a WhatsApp message and a direct link
 */
export const prepareWhatsAppMessage = (lead, business, template) => {
  // Replace all supported variables
  let renderedMessage = (template || '')
    .replace(/{{name}}/g, lead.name || 'Customer')
    .replace(/{{serviceInterest}}/g, lead.serviceInterest || 'our services')
    .replace(/{{phone}}/g, lead.phone || '')
    .replace(/{{email}}/g, lead.email || '');

  let cleanPhone = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  return {
    message: renderedMessage,
    link: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(renderedMessage)}`,
    phone: '+' + cleanPhone
  };
};

/**
 * Sends an automated WhatsApp message via Business API (Meta or Interakt)
 */
export const sendAutoWhatsApp = async (lead, business, template, templateName = null, headerMedia = null, templateLanguage = 'en', metaComponents = null) => {
  const credentials = business.integrationCredentials?.whatsapp;

  if (!credentials || !credentials.enabled) {
    console.log(`[WhatsApp] Skipping: Integration not enabled for ${business.businessName}`);
    return { success: false, reason: 'unconfigured' };
  }

  const provider = credentials.provider || 'meta';

  try {
    if (provider === 'interakt') {
      return await sendInteraktMessage(lead, business, template, templateName, headerMedia);
    } else {
      return await sendMetaMessage(lead, business, template, templateName, headerMedia, templateLanguage, metaComponents);
    }
  } catch (error) {
    console.error(`[WhatsApp] ${provider} send failed:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Meta only allows free-form text within 24h of the customer's last reply.
 * Outside that window, an approved template must be used.
 */
async function hasOpenCustomerCareWindow(leadId, businessId) {
  if (!leadId || !businessId) return false;
  try {
    const Message = (await import('../../models/automation/Message')).default;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const inbound = await Message.findOne({
      leadId,
      businessId,
      direction: 'incoming',
      timestamp: { $gte: since },
    }).select('_id').lean();
    return Boolean(inbound);
  } catch {
    return false;
  }
}

/**
 * Meta Cloud API Native Implementation
 */
export async function sendMetaMessage(lead, business, templateText, templateName, headerMedia, templateLanguage = 'en', metaComponents = null) {
  const credentials = business.integrationCredentials.whatsapp;
  const { phoneNumberId, apiKey } = credentials;

  if (!phoneNumberId || !apiKey) throw new Error('Meta credentials missing');

  const token = decrypt(apiKey);
  const { message, phone } = prepareWhatsAppMessage(lead, business, templateText);
  const cleanPhone = phone.replace('+', '');

  // Free-form text outside the 24h window is accepted by Meta then fails with 131047.
  // Fail fast with a clear error instead of a fake "sent" success.
  if (!templateName) {
    const windowOpen = await hasOpenCustomerCareWindow(lead._id, business._id);
    if (!windowOpen) {
      throw new Error(
        'WhatsApp 24h window closed. Customer must message your business number first, or send an approved Meta template message.'
      );
    }
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  let payload;
  if (templateName) {
    payload = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLanguage }
      }
    };

    if (headerMedia) {
      payload.template.components = payload.template.components || [];
      payload.template.components.push({
        type: "header",
        parameters: [{ type: "video", video: { link: headerMedia } }]
      });
    }

    if (metaComponents && Array.isArray(metaComponents)) {
      const bodyComp = metaComponents.find(c => c.type === 'BODY' || c.type === 'body');
      if (bodyComp && bodyComp.text) {
        const matches = bodyComp.text.match(/\{\{\d+\}\}/g);
        if (matches && matches.length > 0) {
          payload.template.components = payload.template.components || [];
          payload.template.components.push({
            type: "body",
            parameters: matches.map(() => ({ type: "text", text: lead.name || 'Customer' }))
          });
        }
      }
    } else {
      // Fallback: only add parameter if legacy templateText contains variables
      const matches = typeof templateText === 'string' ? templateText.match(/\{\{\w+\}\}/g) : null;
      if (matches && matches.length > 0) {
        payload.template.components = payload.template.components || [];
        payload.template.components.push({
          type: "body",
          parameters: matches.map(() => ({ type: "text", text: lead.name || 'Customer' }))
        });
      }
    }
  } else {
    payload = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: { body: message }
    };
  }

  // If we don't have a rendered message but have metaComponents (Template body), 
  // let's try to create a preview message for our own records.
  let messagePreview = message;
  if (!messagePreview && metaComponents) {
    const bodyComp = metaComponents.find(c => c.type === 'BODY' || c.type === 'body');
    if (bodyComp && bodyComp.text) {
      messagePreview = bodyComp.text.replace(/\{\{\d+\}\}/g, lead.name || 'Customer');
    }
  }

  const response = await fetchExternal(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log(`[WhatsApp:Meta] API Response for ${lead.name}:`, JSON.stringify(data));
  
  if (!response.ok) {
    console.error(`[WhatsApp:Meta] Error Details:`, data);
    throw new Error(data.error?.message || 'Meta API Error');
  }

  await recordOutgoingMessage(lead._id, business._id, messagePreview, data.messages?.[0]?.id, templateName);
  return { success: true, provider: 'meta', messageId: data.messages?.[0]?.id };
}

/**
 * Interakt API Implementation (Preserving complex logic)
 */
async function sendInteraktMessage(lead, business, template, templateName, headerMedia) {
  const credentials = business.integrationCredentials.whatsapp;
  const apiKey = decrypt(credentials.interaktApiKey || credentials.apiKey);
  const { message, phone } = prepareWhatsAppMessage(lead, business, template);

  const authHeader = `Basic ${apiKey}`;

  // 1. Track User
  try {
    await fetchExternal('https://api.interakt.ai/v1/public/track/users/', {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: lead._id,
        fullPhoneNumber: phone,
        traits: { name: lead.name, email: lead.email || '', source: 'LeadForGrow' }
      })
    });
  } catch (e) { console.warn('[WhatsApp] Interakt tracking failed:', e.message); }

  // 2. Build Payload
  let payload;
  if (templateName) {
    const sanitize = (val) => String(val || '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    let headerValues = headerMedia ? [headerMedia] : [];

    // Auto-fix localhost media
    if (headerMedia?.includes('localhost')) {
      headerValues = ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"];
    }

    payload = {
      fullPhoneNumber: phone,
      type: 'Template',
      template: {
        name: templateName,
        languageCode: 'en',
        headerValues: headerValues.length > 0 ? headerValues : undefined,
        bodyValues: [sanitize(lead.name)]
      }
    };
  } else {
    payload = {
      fullPhoneNumber: phone,
      type: 'Text',
      data: { message: message }
    };
  }

  const response = await fetchExternal('https://api.interakt.ai/v1/public/message/', {
    method: 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Interakt API Error');

  await recordOutgoingMessage(lead._id, business._id, message, data.id || data.messageId, templateName);
  return { success: true, provider: 'interakt', data };
}

/**
 * Save outgoing message to DB and update conversation state
 */
export async function recordOutgoingMessage(leadId, businessId, text, externalId, templateName = null) {
  try {
    const bodyText = text
      || (templateName ? `[Template: ${templateName}] Automated message sent.` : 'Automated message sent');

    // Primary: record into the omnichannel conversation so the inbox shows it
    // (with a conversationId) and a realtime event is emitted for live refresh.
    const { recordChannelMessage } = await import('@/lib/omnichannel/conversationService');
    const Lead = (await import('../../models/automation/Lead')).default;
    const lead = await Lead.findById(leadId).select('name phone whatsapp whatsappId').lean();

    // Use the SAME participant key incoming messages use (the wa_id / phone,
    // no leading '+'), so outgoing and incoming land in ONE conversation
    // instead of splitting into two threads for the same person.
    const participantId = String(
      lead?.whatsappId || lead?.whatsapp || lead?.phone || leadId
    ).replace(/^\+/, '');

    await recordChannelMessage({
      businessId,
      channel: 'whatsapp',
      leadId,
      messageId: externalId || `local-${Date.now()}`,
      direction: 'outgoing',
      type: 'text',
      status: 'sent',
      timestamp: new Date(),
      content: {
        body: bodyText,
        participantId,
        participantPhone: lead?.whatsappId || lead?.whatsapp || lead?.phone,
        participantName: lead?.name,
      },
    });

    // Legacy store kept in sync for older chat APIs that read WhatsAppConversation.
    const WhatsAppConversation = (await import('../../models/automation/WhatsAppConversation')).default;
    const existingConv = await WhatsAppConversation.findOne({ businessId, leadId });
    const nextStatus = existingConv?.status === 'intervened' ? 'intervened' : 'read';
    await WhatsAppConversation.findOneAndUpdate(
      { businessId, leadId },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: bodyText.substring(0, 100),
          lastMessageDirection: 'outgoing',
          status: nextStatus,
          unreadCount: 0,
        },
      },
      { upsert: true }
    );
  } catch (err) { console.error('[WhatsApp] DB Recording failed:', err); }
}
