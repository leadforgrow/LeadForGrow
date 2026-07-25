/**
 * Resend API Utility
 * Optimized for sending transactional emails without nodemailer.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const sendResendEmail = async ({ to, from = 'LeadForGrow <info@leadforgrow.com>', subject, html, text }) => {
  const logPrefix = '[Resend API]';

  if (!RESEND_API_KEY) {
    console.warn(`${logPrefix} RESEND_API_KEY not configured — email not sent.`);
    return { success: false, error: 'Email provider not configured' };
  }

  try {
    const payload = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || '',
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`${logPrefix} Send failed (${response.status}): ${data.message || 'Unknown error'}`);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log(`${logPrefix} Email sent (id: ${data.id}) to ${JSON.stringify(payload.to)}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`${logPrefix} Error in sendResendEmail:`, error.message);
    return { success: false, error: error.message };
  }
};
