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
  const cleanPhone = lead.phone.replace(/\D/g, '');
  
  // Create wa.me link
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(renderedMessage)}`;
  
  return {
    message: renderedMessage,
    link: waLink,
    phone: lead.phone
  };
};

/**
 * Sends an automated WhatsApp message via Business API (Placeholder for future)
 * @param {object} lead - The lead document
 * @param {object} business - The business document
 * @param {string} template - The template
 */
export const sendAutoWhatsApp = async (lead, business, template) => {
  const credentials = business.integrationCredentials?.whatsapp;
  
  if (!credentials || !credentials.enabled || !credentials.apiKey) {
    console.log(`[WhatsApp] Skipping: API not configured for ${business.businessName}`);
    return { success: false, reason: 'unconfigured' };
  }

  // NOTE: This is where we would call the Facebook/Graph API for WhatsApp
  // Implementation depends on the specific provider/API
  try {
    const { message } = prepareWhatsAppMessage(lead, business, template);
    
    // Example: fetch('https://graph.facebook.com/v17.0/PHONE_NUMBER_ID/messages', ...)
    
    console.log(`[WhatsApp] Auto-message prepared (API call simulator): ${message}`);
    return { success: true, status: 'simulated' };
  } catch (error) {
    console.error('[WhatsApp] Failed:', error);
    return { success: false, error: error.message };
  }
};
