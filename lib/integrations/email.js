import nodemailer from 'nodemailer';

/**
 * Renders a message template with lead data
 * @param {string} template - The message template with {{field}} placeholders
 * @param {object} lead - The lead document
 * @returns {string} - The rendered message
 */
export const renderTemplate = (template, lead) => {
  if (!template) return '';
  
  const placeholders = {
    name: lead.name || 'there',
    phone: lead.phone || '',
    email: lead.email || '',
    serviceInterest: lead.serviceInterest || 'our services',
    message: lead.message || '',
    businessName: lead.metadata?.businessName || 'LeadForGrow'
  };

  return template.replace(/\{\{(.*?)\}\}/g, (match, field) => {
    return placeholders[field.trim()] || match;
  });
};

/**
 * Creates a standardized transporter for a specific business
 * Optimized for Titan/Flockmail and custom business domains
 */
const createTransporter = (credentials) => {
  if (!credentials || !credentials.enabled) {
    throw new Error('Email integration is not enabled for this business');
  }

  const { host, port, username, password } = credentials;

  // Hardened SMTP Configuration
  const transporterConfig = {
    host: host.trim(),
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: username.trim(),
      pass: password
    },
    // Titan/Flockmail specific fixes
    name: username.split('@')[1] || 'leadforgrow.online', // HELLO identification
    authMethod: 'LOGIN', // Higher success rate with Titan than PLAIN
    tls: {
      rejectUnauthorized: false, // Bypass self-signed/proxy cert issues
      minVersion: 'TLSv1.2'     // Modern security standard
    },
    debug: true,
    logger: true
  };

  return nodemailer.createTransport(transporterConfig);
};

/**
 * Sends an automated lead acknowledgment
 */
export const sendLeadMail = async (lead, business, template, subject = 'We received your interest!') => {
  try {
    const credentials = business.integrationCredentials?.email;
    if (!credentials || !credentials.enabled) {
      console.log(`[Email] Skipping: Integration disabled for ${business.businessName}`);
      return { success: false, reason: 'disabled' };
    }

    const transporter = createTransporter(credentials);
    const content = renderTemplate(template, lead);

    const mailOptions = {
      from: `"${credentials.fromName || business.businessName}" <${credentials.fromEmail || credentials.username}>`,
      to: lead.email,
      subject: renderTemplate(subject, lead),
      text: content,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Hello ${lead.name.split(' ')[0]}!</h2>
          <div style="font-size: 16px; line-height: 1.6;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">
            Sent via <strong>${business.businessName}</strong> using LeadForGrow Automation.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${lead.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Specialized function for reputation warming / testing
 */
export const sendWarmingMail = async (business, targetEmail) => {
  const testLead = {
    name: 'Warming Test',
    email: targetEmail,
    serviceInterest: 'Email Verification'
  };
  
  const warmingTemplate = `Your LeadForGrow Email integration is now active! \n\nThis test email confirms that your connection to Titan Mail is stable.`;
  
  return sendLeadMail(testLead, business, warmingTemplate, `Connection SUCCESS: ${business.businessName}`);
};
