/**
 * lib/call-automation/providers/twilio_validator.js
 * Validates Twilio credentials and phone numbers using the real Twilio API.
 */

/**
 * Validates Twilio Account SID and Auth Token by fetching account details.
 * @param {string} accountSid Twilio Account SID
 * @param {string} authToken Twilio Auth Token
 * @returns {Promise<{success: boolean, error?: string, accountName?: string}>}
 */
export async function validateTwilioCredentials(accountSid, authToken) {
  if (!accountSid || !authToken) {
    return { success: false, error: 'Account SID and Auth Token are required' };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.status !== 'active') {
        return { success: false, error: `Account is ${data.status}` };
      }
      return { 
        success: true, 
        accountName: data.friendly_name
      };
    } else {
      return { 
        success: false, 
        error: data.message || `Twilio Error: ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error('[TwilioValidator] Connection Error:', error);
    return { success: false, error: 'Failed to connect to Twilio API. Check your network.' };
  }
}

/**
 * Validates if the given phone number exists and is active in the Twilio account.
 * @param {string} accountSid Twilio Account SID
 * @param {string} authToken Twilio Auth Token
 * @param {string} phoneNumber Phone number to validate (E.164 format)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateTwilioPhoneNumber(accountSid, authToken, phoneNumber) {
  if (!phoneNumber) return { success: true }; // Optional check

  try {
    // Search for the phone number in the account's incoming numbers
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(phoneNumber)}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.incoming_phone_numbers && data.incoming_phone_numbers.length > 0) {
        return { success: true };
      } else {
        return { success: false, error: `Phone number ${phoneNumber} not found in this Twilio account.` };
      }
    } else {
      return { success: false, error: data.message || 'Failed to validate phone number.' };
    }
  } catch (error) {
    console.error('[TwilioValidator] Phone Validation Error:', error);
    return { success: false, error: 'Error connecting to Twilio for phone validation.' };
  }
}

/**
 * Initiates a phone number verification request with Twilio.
 * This will trigger a call to the phone number with a 6-digit validation code.
 * @param {string} accountSid Twilio Account SID
 * @param {string} authToken Twilio Auth Token
 * @param {string} phoneNumber Phone number to verify (E.164 format)
 * @returns {Promise<{success: boolean, validationCode?: string, error?: string}>}
 */
export async function initiateTwilioPhoneNumberVerification(accountSid, authToken, phoneNumber) {
  if (!accountSid || !authToken || !phoneNumber) {
    return { success: false, error: 'Missing credentials or phone number' };
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/OutgoingCallerIds.json`;
    
    const formData = new URLSearchParams();
    formData.append('PhoneNumber', phoneNumber);
    // FriendlyName is optional
    formData.append('FriendlyName', `LFG Verified: ${phoneNumber}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      return { 
        success: true, 
        validationCode: data.validation_code 
      };
    } else {
      // If code is 21450, it means it's already verified
      if (data.code === 21450) {
        return { success: true, alreadyVerified: true };
      }
      return { 
        success: false, 
        error: data.message || 'Failed to initiate verification.' 
      };
    }
  } catch (error) {
    console.error('[TwilioValidator] Verification Error:', error);
    return { success: false, error: 'Connection error during verification request.' };
  }
}
