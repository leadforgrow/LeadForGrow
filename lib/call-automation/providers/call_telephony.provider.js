import Business from '@/models/Business';

export const callTelephonyProvider = {
  /**
   * Place an outbound AI-driven call
   */
  makeAiCall: async (to, from, scriptUrl, businessId) => {
    console.log(`[Telephony] Initiating call to ${to} for business ${businessId}`);

    // 1. Fetch Credentials securely
    const business = await Business.findById(businessId).select('+settings.callAutomation.telephony.apiKey +settings.callAutomation.telephony.apiSecret');
    const config = business?.settings?.callAutomation?.telephony;

    if (!config || !config.apiKey) {
      console.warn('[Telephony] No API Key found. Simulating call.');
      return { success: true, callSid: `sim_${Math.random().toString(36).substr(2)}`, status: 'queued (simulated)' };
    }

    try {
      // 2. Real Integration: VAPI.AI
      if (config.provider === 'vapi') {
        const response = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumberId: config.phoneNumberId,
            customer: { number: to },
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
        const authToken = config.apiKey;
        const fromNumber = config.phoneNumberId;

        if (!accountSid || !authToken || !fromNumber) {
          throw new Error('Missing Twilio Credentials (SID, Token, or Phone)');
        }

        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

        const formData = new URLSearchParams();
        formData.append('To', to);
        formData.append('From', fromNumber);
        formData.append('Url', scriptUrl || 'http://demo.twilio.com/docs/voice.xml');

        // Use API Key/Secret if available, otherwise fallback to Account SID/Auth Token
        const username = config.apiSecret ? config.apiKey : accountSid;
        const password = config.apiSecret ? config.apiSecret : config.apiKey;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
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
  },

  /**
   * Generate a JWT Access Token for Twilio Voice Client-to-PSTN
   */
  generateTwilioAccessToken: async (businessId) => {
    const business = await Business.findById(businessId).select('+settings.callAutomation.telephony');
    const config = business?.settings?.callAutomation?.telephony;

    if (!config || config.provider !== 'twilio') {
      throw new Error('Twilio not configured for this business');
    }

    // Use dynamic import to avoid issues if twilio isn't loaded yet
    const twilio = (await import('twilio')).default;
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      config.assistantId, // Twilio Account SID
      config.apiKey,      // Twilio API Key
      config.apiSecret,   // Twilio API Secret
      { identity: `user_${Math.random().toString(36).substr(2, 9)}` }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twimlAppSid, // Correct TwiML App SID
      incomingAllow: true
    });

    token.addGrant(voiceGrant);
    return token.toJwt();
  },

  validateCredentials: async (provider, credentials) => {
    try {
      if (provider === 'vapi') {
        const res = await fetch('https://api.vapi.ai/me', {
          headers: { 'Authorization': `Bearer ${credentials.apiKey}` }
        });
        const data = await res.json();
        return { success: res.ok, error: res.ok ? null : (data.message || 'Vapi Error') };
      }

      if (provider === 'twilio') {
        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${credentials.assistantId}.json`;

        // Use API Key/Secret if available, otherwise fallback to Account SID/Auth Token
        const username = credentials.apiSecret ? credentials.apiKey : credentials.assistantId;
        const password = credentials.apiSecret ? credentials.apiSecret : credentials.apiKey;

        const auth = Buffer.from(`${username}:${password}`).toString('base64');
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': 'Basic ' + auth
          }
        });
        const data = await res.json();
        return { success: res.ok, error: res.ok ? null : (data.message || 'Twilio Error') };
      }

      return { success: false, error: 'Unsupported Provider' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
