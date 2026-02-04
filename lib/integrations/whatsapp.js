import { renderTemplate } from './email';

/**
 * Generates a WhatsApp message and a direct link
 * @param {object} lead - The lead document
 * @param {object} business - The business document
 * @param {string} template - The message template
 * @returns {object} - Rendered message and wa.me link
 */
export const prepareWhatsAppMessage = (lead, business, template) => {
  const renderedMessage = renderTemplate(template, lead);
  
  // Format phone number: remove non-digits
  let cleanPhone = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
  
  // If it's a 10-digit number, prepend 91 (Defaulting to India as per user context)
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  
  // Create wa.me link
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(renderedMessage)}`;
  
  return {
    message: renderedMessage,
    link: waLink,
    phone: cleanPhone
  };
};

/**
 * Sends an automated WhatsApp message via Business API (Meta or Interakt)
 * @param {object} lead - The lead document
 * @param {object} business - The business document
 * @param {string} template - The message text/template
 */
export const sendAutoWhatsApp = async (lead, business, template) => {
  const credentials = business.integrationCredentials?.whatsapp;
  
  if (!credentials || !credentials.enabled) {
    console.log(`[WhatsApp] Skipping: Integration not enabled for ${business.businessName}`);
    return { success: false, reason: 'unconfigured' };
  }

  if (!lead.phone) {
    console.log(`[WhatsApp] Skipping: No phone number provided for lead ${lead.name}`);
    return { success: false, reason: 'no_phone' };
  }

  try {
    const { message, phone } = prepareWhatsAppMessage(lead, business, template);
    
    if (credentials.provider === 'interakt') {
      const apiKey = credentials.interaktApiKey;
      if (!apiKey) throw new Error('Interakt API Key missing');

      console.log(`[WhatsApp] Sending via Interakt to ${phone}...`);
      
      const authHeader = `Basic ${apiKey}`;
      const response = await fetch('https://api.interakt.ai/v1/public/message/', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullPhoneNumber: phone,
          type: 'Text',
          data: {
            message: message
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Interakt Error: ${response.status}`);
      }

      console.log(`[WhatsApp] Interakt success:`, data);
      return { success: true, provider: 'interakt', data };
    } else {
      // Default to Meta API (Simulator for now)
      if (!credentials.apiKey) {
        console.log(`[WhatsApp] Skipping Meta: API key missing`);
        return { success: false, reason: 'unconfigured' };
      }

      console.log(`[WhatsApp] Sending via Meta Cloud API to ${phone}...`);
      console.log(`[WhatsApp] Payload: ${message}`);
      
      // Implementation for Meta API would go here
      // For now, keep it simulated but log it
      return { success: true, provider: 'meta', status: 'simulated' };
    }
  } catch (error) {
    console.error('[WhatsApp] Failed:', error);
    return { success: false, error: error.message };
  }
};
