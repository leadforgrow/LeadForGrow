import Business from '@/models/Business';
import { decrypt } from '@/lib/encryption';
import { normalizePhoneNumber } from '@/lib/phone_normalization';

export const callTelephonyProvider = {
  /**
   * Place an outbound AI-driven call
   */
  makeAiCall: async (to, from, scriptUrl, businessId) => {
    // Normalize destination number
    const normalizedTo = normalizePhoneNumber(to);
    console.log(`[Telephony] Initiating call to ${normalizedTo} (raw: ${to}) for business ${businessId}`);
    
    // 1. Fetch Credentials securely
    const business = await Business.findById(businessId).select('+settings.callAutomation.telephony.apiKey');
    const config = business?.settings?.callAutomation?.telephony;
    
    // Decrypt API Key if it looks like it's encrypted
    let apiKey = config?.apiKey;
    if (apiKey && apiKey.includes(':')) {
      apiKey = decrypt(apiKey);
    }

    if (!config || !apiKey) {
      console.warn('[Telephony] No API Key found. Simulating call.');
      return { success: true, callSid: `sim_${Math.random().toString(36).substr(2)}`, status: 'queued (simulated)' };
    }

    try {
      // 2. Real Integration: VAPI.AI
      if (config.provider === 'vapi') {
        const response = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumberId: config.phoneNumberId,
            customer: { number: normalizedTo },
            assistantId: config.assistantId || "default" 
          })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Provider Error');
        
        return { success: true, callSid: data.id, status: 'queued' };
      }

      // 3. Twilio Integration via Fetch
      if (config.provider === 'twilio') {
        const accountSid = config.assistantId;
        const authToken = apiKey; // Use decrypted key
        const fromNumber = config.phoneNumberId;

        if (!accountSid || !authToken || !fromNumber) {
           throw new Error('Missing Twilio Credentials (SID, Token, or Phone)');
        }

        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
        
        const formData = new URLSearchParams();
        formData.append('To', normalizedTo);
        formData.append('From', fromNumber);
        formData.append('Url', scriptUrl || 'http://demo.twilio.com/docs/voice.xml'); 

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(`Twilio Error: ${data.message || response.statusText}`);
        }

        return { success: true, callSid: data.sid, status: data.status };
      }

    } catch (error) {
      console.error('[Telephony] Provider Call Failed:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, callSid: `sim_${Math.random().toString(36).substr(2)}`, status: 'queued' };
  },

  handleInterruption: async (callSid) => {
    console.log(`[Telephony] Handling interruption for call ${callSid}`);
  }
};
