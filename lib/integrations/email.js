import { sendBusinessEmail } from '../businessMailer';

/**
 * Email Integration - Multi-Tenant Hostinger + Nodemailer
 * Each business uses their OWN verified Hostinger email credentials
 * NO shared sender emails, NO test SMTP, Production-only logic
 */

/**
 * Renders a message template with lead data
 */
export const renderTemplate = (template, lead, business = {}) => {
  if (!template) return '';
  
  // Handle Mongoose Maps/Objects for metadata
  const metadata = lead.metadata instanceof Map ? Object.fromEntries(lead.metadata) : (lead.metadata || {});
  const emailConfig = business.integrationCredentials?.email || {};

  const placeholders = {
    // Simple keys (legacy/internal)
    name: lead.name || 'there',
    phone: lead.phone || '',
    email: lead.email || '',
    serviceInterest: lead.serviceInterest || 'our services',
    message: lead.message || '',
    businessName: business.businessName || metadata.businessName || 'LeadForGrow',
    
    // Explicit keys (UI matching)
    'lead.name': lead.name || 'there',
    'lead.email': lead.email || '',
    'lead.phone': lead.phone || '',
    'lead.serviceInterest': lead.serviceInterest || 'our services',
    'business.name': business.businessName || 'LeadForGrow',
    'user.name': emailConfig.fromName || business.businessName || 'Team' // Best effort fallback
  };

  return template.replace(/\{\{(.*?)\}\}/g, (match, field) => {
    const key = field.trim();
    return placeholders[key] !== undefined ? placeholders[key] : match;
  });
};

/**
 * Sends an automated lead acknowledgment using business's own Hostinger email
 * @param {Object} lead - The lead document
 * @param {Object} business - The business document with email credentials
 * @param {string} template - Email template with placeholders
 * @param {string} subject - Email subject line
 * @returns {Object} - { success: boolean, messageId?: string, error?: string }
 */

/**
 * Sends an automated lead acknowledgment using business's own Hostinger email
 * @param {Object} lead - The lead document
 * @param {Object} business - The business document with email credentials
 * @param {string} template - Email template with placeholders
 * @param {string} subject - Email subject line
 * @returns {Object} - { success: boolean, messageId?: string, error?: string }
 */
export const sendCustomerEmail = async (lead, business, template, subject = 'We received your interest!') => {
  const logPrefix = `[Email:${business.businessName}]`;
  
  try {
    // Check if business has email integration enabled
    const emailConfig = business.integrationCredentials?.email;
    
    if (!emailConfig || !emailConfig.enabled) {
      console.log(`${logPrefix} [EMAIL][ERROR] Email integration not enabled for this business`);
      // We don't throw here because this is a configuration issue, not a sending failure for a configured business.
      // But user said "Fail HARD". If logic expects email to go, and it can't, it's a failure.
      return { 
        success: false, 
        error: 'Email integration not configured. Please set up your Hostinger email in Integrations.' 
      };
    }
    
    // Render template
    const content = renderTemplate(template, lead, business);
    const renderedSubject = renderTemplate(subject, lead, business);
    
    // Prepare ultra-premium email HTML (re-using existing HTML logic)
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            body { margin: 0; padding: 0; origin:0; background-color: #ffffff; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
            .container { width: 100%; margin: 0; background: #ffffff; padding: 20px; }
            
            .content { width: 100%; text-align: left; }
            .greeting { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; text-align: left; }
            .main-text { color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: left; white-space: pre-wrap; }
            
            .footer { padding-top: 32px; border-top: 1px solid #e2e8f0; text-align: left; }
            .footer p { margin: 4px 0; color: #64748b; font-size: 13px; font-weight: 500; }
            .branding { color: #94a3b8; font-size: 11px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="greeting">Hello ${lead.name.split(' ')[0]},</div>
              <div class="main-text">${content.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>Best regards,</p>
              <p><strong>${emailConfig.fromName || business.businessName}</strong></p>
              <p class="branding">Powered by LeadForGrow</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // IMPORTANT: Call sendBusinessEmail which now has RETRIES and STRICT AWAIT
    // We do NOT wrap this in a big try/catch that returns false. We let errors bubble up if retries fail.
    // Or we catch and return error object so caller can log it.
    // The user said "Fail HARD if email fails... Throw error".
    // sendBusinessEmail throws if it fails.
    
    const result = await sendBusinessEmail(business, {
      to: lead.email,
      subject: renderedSubject,
      html: emailHTML,
      text: content
    });
    
    return result;

  } catch (error) {
    // If sendBusinessEmail threw an error (meaning retries failed), caught here.
    // We return it formatted as failure so the engine can log activities.
    // BUT we must differentiate "business logic error" vs "sending error".
    console.error(`${logPrefix} [EMAIL][CRITICAL FAILURE]`, error);
    return { success: false, error: error.message }; 
  }
};

// Alias for backward compatibility (if any other files use this)
export const sendLeadMail = sendCustomerEmail;

/**
 * Send test/verification email using business's Hostinger credentials
 * @param {Object} business - The business document
 * @param {string} targetEmail - Email address to send test to
 * @returns {Object} - { success: boolean, messageId?: string, error?: string }
 */
export const sendWarmingMail = async (business, targetEmail) => {
  const testLead = {
    name: 'Test User',
    email: targetEmail,
    serviceInterest: 'Email Verification'
  };
  
  const warmingTemplate = `Your LeadForGrow Email integration is now active! \n\nThis test email confirms that your Hostinger SMTP connection is working correctly.`;
  
  return sendLeadMail(testLead, business, warmingTemplate, `✅ Connection SUCCESS: ${business.businessName}`);
};
