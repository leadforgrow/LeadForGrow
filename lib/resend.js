/**
 * Resend API Utility
 * Optimized for sending transactional emails without nodemailer.
 */

const RESEND_API_KEY = 're_NvDa6gwg_52MLrvBAnTrFKnpG9fLwVW45';

export const sendResendEmail = async ({ to, from = 'LeadForGrow <info@leadforgrow.com>', subject, html, text }) => {
  const logPrefix = '[Resend API]';
  
  try {
    console.log(`${logPrefix} ========== RESEND API CALL START ==========`);
    console.log(`${logPrefix} Step 1: Preparing API request...`);
    console.log(`${logPrefix}   - API Endpoint: https://api.resend.com/emails`);
    console.log(`${logPrefix}   - API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
    
    const payload = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || '',
    };
    
    console.log(`${logPrefix} Step 2: Request payload prepared`);
    console.log(`${logPrefix}   - From: ${from}`);
    console.log(`${logPrefix}   - To: ${JSON.stringify(payload.to)}`);
    console.log(`${logPrefix}   - Subject: ${subject}`);
    console.log(`${logPrefix}   - HTML Length: ${html?.length || 0} characters`);
    console.log(`${logPrefix}   - Text Length: ${text?.length || 0} characters`);
    
    console.log(`${logPrefix} Step 3: Sending POST request to Resend API...`);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`${logPrefix} Step 4: Received response from Resend API`);
    console.log(`${logPrefix}   - Status Code: ${response.status}`);
    console.log(`${logPrefix}   - Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log(`${logPrefix} Step 5: Parsed response data`);
    console.log(`${logPrefix}   - Response:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`${logPrefix} Step 6: ❌ API REQUEST FAILED`);
      console.error(`${logPrefix}   - Error Message: ${data.message || 'Unknown error'}`);
      console.error(`${logPrefix}   - Error Details:`, data);
      console.log(`${logPrefix} ========== RESEND API CALL END (FAILED) ==========\n`);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log(`${logPrefix} Step 6: ✅ EMAIL SENT SUCCESSFULLY VIA RESEND`);
    console.log(`${logPrefix}   - Email ID: ${data.id}`);
    console.log(`${logPrefix}   - Recipient(s): ${JSON.stringify(payload.to)}`);
    console.log(`${logPrefix}   - From: ${from}`);
    console.log(`${logPrefix} ========== RESEND API CALL END (SUCCESS) ==========\n`);
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`${logPrefix} ❌ FATAL ERROR in sendResendEmail:`, error);
    console.error(`${logPrefix}   - Error Type: ${error.name}`);
    console.error(`${logPrefix}   - Error Message: ${error.message}`);
    console.error(`${logPrefix}   - Error Stack:`, error.stack);
    console.log(`${logPrefix} ========== RESEND API CALL END (ERROR) ==========\n`);
    return { success: false, error: error.message };
  }
};
