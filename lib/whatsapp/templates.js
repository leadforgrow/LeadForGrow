import axios from 'axios';

/**
 * WhatsApp Template Sender - Production Utility
 */
export async function sendWhatsAppTemplate({ 
  to, 
  templateName, 
  languageCode = 'en', 
  components = [],
  businessCredentials 
}) {
  const { apiKey, phoneNumberId } = businessCredentials;

  if (!apiKey || !phoneNumberId) {
    throw new Error('Missing WhatsApp configuration for business');
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      components: components // Dynamic variables like {{1}} for name
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return { 
      success: true, 
      messageId: response.data.messages?.[0]?.id,
      raw: response.data 
    };
  } catch (error) {
    const errorData = error.response?.data?.error || { message: error.message };
    console.error('[WhatsAppTemplate] Error sending template:', errorData);
    throw new Error(`WhatsApp API Error: ${errorData.message}`);
  }
}

/**
 * Fetches all approved templates from Meta WhatsApp Business Account
 */
export async function fetchMetaTemplates(businessCredentials) {
  const { apiKey, businessAccountId } = businessCredentials;

  if (!apiKey || !businessAccountId) {
    throw new Error('Missing WhatsApp Business Account ID or API Key');
  }

  const url = `https://graph.facebook.com/v21.0/${businessAccountId}/message_templates`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        limit: 100,
        status: 'APPROVED'
      }
    });

    return response.data.data || [];
  } catch (error) {
    const errorData = error.response?.data?.error || { message: error.message };
    console.error('[WhatsAppTemplate] Error fetching templates:', errorData);
    throw new Error(`Meta API Error: ${errorData.message}`);
  }
}
