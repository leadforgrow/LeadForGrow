import { sendBusinessEmail } from '../businessMailer';

/**
 * Email Integration - Multi-Tenant Hostinger + Nodemailer
 * Each business uses their OWN verified Hostinger email credentials
 * NO shared sender emails, NO test SMTP, Production-only logic
 */

/**
 * Renders a message template with lead data
 */
export const renderTemplate = (template, lead) => {
  if (!template) return '';
  
  // Handle Mongoose Maps/Objects for metadata
  const metadata = lead.metadata instanceof Map ? Object.fromEntries(lead.metadata) : (lead.metadata || {});

  const placeholders = {
    name: lead.name || 'there',
    phone: lead.phone || '',
    email: lead.email || '',
    serviceInterest: lead.serviceInterest || 'our services',
    message: lead.message || '',
    businessName: metadata.businessName || 'LeadForGrow'
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
export const sendLeadMail = async (lead, business, template, subject = 'We received your interest!') => {
  const logPrefix = `[Email:${business.businessName}]`;
  
  try {
    console.log(`${logPrefix} ========== EMAIL SEND PROCESS START ==========`);
    console.log(`${logPrefix} [FORM] Lead: ${lead.name} (${lead.email})`);
    console.log(`${logPrefix} [FORM] Business ID: ${business._id}`);
    
    // Check if business has email integration enabled
    const emailConfig = business.integrationCredentials?.email;
    
    if (!emailConfig || !emailConfig.enabled) {
      console.log(`${logPrefix} [EMAIL][ERROR] Email integration not enabled for this business`);
      return { 
        success: false, 
        error: 'Email integration not configured. Please set up your Hostinger email in Integrations.' 
      };
    }
    
    console.log(`${logPrefix} [EMAIL] Fetching business SMTP credentials`);
    console.log(`${logPrefix} [EMAIL]   - Email: ${emailConfig.fromEmail || emailConfig.username}`);
    console.log(`${logPrefix} [EMAIL]   - Display Name: ${emailConfig.fromName || business.businessName}`);
    console.log(`${logPrefix} [EMAIL]   - Host: ${emailConfig.host || 'smtp.hostinger.com'}`);
    console.log(`${logPrefix} [EMAIL]   - Port: ${emailConfig.port || 465}`);
    
    // Render template
    console.log(`${logPrefix} [EMAIL] Rendering email template...`);
    const content = renderTemplate(template, lead);
    const renderedSubject = renderTemplate(subject, lead);
    console.log(`${logPrefix} [EMAIL]   - Subject: ${renderedSubject}`);
    console.log(`${logPrefix} [EMAIL]   - Content Length: ${content.length} characters`);
    
    // Prepare ultra-premium email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.8); }
            .hero { background: #0f172a; padding: 60px 40px; text-align: left; position: relative; }
            .hero-accent { position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%); }
            .hero h1 { color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
            .hero p { color: #94a3b8; font-size: 16px; margin-top: 12px; font-weight: 500; }
            .content { padding: 48px 40px; }
            .greeting { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 24px; }
            .main-text { color: #475569; font-size: 16px; line-height: 1.8; margin-bottom: 32px; }
            
            .summary-card { background: #f8fafc; border-radius: 28px; padding: 32px; border: 1px solid #e2e8f0; margin: 40px 0; }
            .summary-label { font-size: 12px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; display: block; }
            .summary-item { display: flex; align-items: center; margin-bottom: 8px; }
            .summary-value { font-size: 18px; font-weight: 700; color: #0f172a; }
            .service-tag { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 8px 16px; border-radius: 100px; font-size: 14px; font-weight: 700; margin-top: 8px; }
            
            .footer { padding: 40px; background: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9; }
            .footer p { margin: 8px 0; color: #64748b; font-size: 13px; font-weight: 500; }
            .badge { display: inline-block; background: #000; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="hero">
                <div class="hero-accent"></div>
                <h1>Success!</h1>
                <p>Your request is now being processed.</p>
              </div>
              <div class="content">
                <div class="greeting">Hello ${lead.name.split(' ')[0]},</div>
                <div class="main-text">
                  ${content.replace(/\n/g, '<br>')}
                </div>
                
                <div class="summary-card">
                  <span class="summary-label">Enquiry Summary</span>
                  <div class="summary-item">
                    <span class="summary-value">${lead.serviceInterest || 'General Inquiry'}</span>
                  </div>
                  <div class="service-tag">⚡ Direct Submission</div>
                  <p style="margin: 16px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500;">One of our experts will contact you shortly via call or WhatsApp.</p>
                </div>
              </div>
              <div class="footer">
                <p>Sent by <strong>${emailConfig.fromName || business.businessName}</strong></p>
                <div class="badge">LFG AUTOMATION</div>
                <p style="opacity: 0.5; font-size: 11px; margin-top: 32px;">© ${new Date().getFullYear()} LeadForGrow Engine. Private & Confidential.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    console.log(`${logPrefix} [EMAIL] Creating Nodemailer transporter`);
    console.log(`${logPrefix} [EMAIL] Sending email to business owner`);
    
    // Send email using business's own Hostinger credentials
    const result = await sendBusinessEmail(business, {
      to: lead.email,
      subject: renderedSubject,
      html: emailHTML,
      text: content
    });
    
    if (result.success) {
      console.log(`${logPrefix} [EMAIL] ✅ Sent successfully (Message ID: ${result.messageId})`);
      console.log(`${logPrefix} ========== EMAIL SEND PROCESS END ==========\n`);
      return { 
        success: true, 
        id: result.messageId,
        messageId: result.messageId 
      };
    } else {
      console.log(`${logPrefix} [EMAIL][ERROR] ${result.error}`);
      console.log(`${logPrefix} ========== EMAIL SEND PROCESS END (FAILED) ==========\n`);
      return { 
        success: false, 
        error: result.error 
      };
    }
    
  } catch (error) {
    console.error(`${logPrefix} [EMAIL][ERROR] FATAL ERROR in sendLeadMail:`, error);
    console.error(`${logPrefix}   - Error Message: ${error.message}`);
    console.error(`${logPrefix}   - Error Stack:`, error.stack);
    console.log(`${logPrefix} ========== EMAIL SEND PROCESS END (ERROR) ==========\n`);
    return { success: false, error: error.message };
  }
};

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
