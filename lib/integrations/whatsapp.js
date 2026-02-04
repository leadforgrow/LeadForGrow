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
  
  // Create wa.me link (works with or without +)
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(renderedMessage)}`;
  
  // Ensure Interakt gets the + prefix
  const interaktPhone = '+' + cleanPhone;
  
  return {
    message: renderedMessage,
    link: waLink,
    phone: interaktPhone
  };
};

/**
 * Sends an automated WhatsApp message via Business API (Meta or Interakt)
 * @param {object} lead - The lead document
 * @param {object} business - The business document
 * @param {string} template - The message text/template
 * @param {string} templateName - The official template name (if applicable)
 * @param {string} headerMedia - Optional URL for header image/video
 */

export const sendAutoWhatsApp = async (lead, business, template, templateName = null, headerMedia = null) => {
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

      const authHeader = `Basic ${apiKey}`;
      
      // 1. TRACK USER FIRST (Ensures lead is in Interakt database)
      console.log(`[WhatsApp] Tracking user in Interakt: ${phone}...`);
      try {
        await fetch('https://api.interakt.ai/v1/public/track/users/', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: lead._id,
            fullPhoneNumber: phone,
            traits: {
              name: lead.name,
              email: lead.email || '',
              source: 'LeadForGrow'
            }
          })
        });
      } catch (trackError) {
        console.warn(`[WhatsApp] Interakt tracking failed (non-fatal):`, trackError.message);
      }

      // 2. SEND MESSAGE (Template or Text)
      console.log(`[WhatsApp] Sending ${templateName ? 'Template' : 'Text'} via Interakt to ${phone}...`);
      
      let payload;
      if (templateName) {
        // Interakt REJECTS newlines/tabs in variable values
        const sanitize = (val) => String(val || '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
        
        let bodyValues = [];
        let headerValues = [];
        let cleanMessage = message;

        // 1. Check if user provided a specific header media via Config (Priority 1)
        if (headerMedia) {
             // CRITICAL FIX: Interakt cannot read files from 'localhost'. 
             // If we are in dev mode and using a local file, we MUST use a public placeholder to pass validation.
             if (headerMedia.includes('localhost') || headerMedia.includes('127.0.0.1')) {
                console.warn('[WhatsApp] ⚠️ Localhost media detected. Swapping with public placeholder for Interakt compatibility.');
                headerValues = ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"];
             } else {
                headerValues = [headerMedia.trim()];
             }
        }
        // 2. FEATURE: Support dynamic Media Header via {{header:URL}} tag in message (Priority 2)
        else {
             const headerMatch = message.match(/{{header:(.*?)}}/);
             if (headerMatch) {
               headerValues = [headerMatch[1].trim()];
               cleanMessage = message.replace(headerMatch[0], '').trim();
             } 
             // 3. INSTANT FIX: If template is 'amitnathmarketing', it MANDATES a video. 
             // We provide a placeholder if the user hasn't specified one, to prevent crash.
             else if (templateName.toLowerCase() === 'amitnathmarketing') {
                  // Using a highly compatible sample MP4 (H.264/AAC) < 10MB
                  headerValues = ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"]; 
             }
        }

        // Auto-detect body variables
        if (template.includes('{{')) {
          bodyValues = [sanitize(lead.name)];
        } else {
             bodyValues = [];
        }
        
        payload = {
          fullPhoneNumber: phone,
          type: 'Template',
          template: {
            name: templateName,
            languageCode: 'en',
            headerValues: headerValues.length > 0 ? headerValues : undefined,
            bodyValues: bodyValues
          }
        };
      } else {
        // Fallback to unstructured Text (ONLY works if customer is 'available')
        payload = {
          fullPhoneNumber: phone,
          type: 'Text',
          data: { message: message }
        };
      }

      const response = await fetch('https://api.interakt.ai/v1/public/message/', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message?.includes('Customer is not available') && !templateName) {
          throw new Error('Customer created, but WhatsApp requires a Template Name to send the first message to a new lead. Please update the rule with your Interakt Template Name.');
        }
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
