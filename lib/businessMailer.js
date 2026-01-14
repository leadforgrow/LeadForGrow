import nodemailer from 'nodemailer';
import { decrypt } from './encryption';

/**
 * Business Email Mailer Factory
 * Creates dynamic Nodemailer transporters using business-specific Hostinger credentials
 * 
 * CRITICAL RULES:
 * - Each business uses their OWN verified Hostinger email
 * - NO shared sender emails
 * - NO test SMTP
 * - Production-only logic
 */

/**
 * Create a Nodemailer transporter for a specific business
 * @param {Object} business - The business document from MongoDB
 * @returns {Object} - Nodemailer transporter instance
 */
export async function createBusinessMailer(business) {
  const logPrefix = `[BusinessMailer:${business.businessName}]`;
  
  console.log(`${logPrefix} Creating Nodemailer transporter...`);
  
  // Validate business has email integration configured
  const emailConfig = business.integrationCredentials?.email;
  
  if (!emailConfig || !emailConfig.enabled) {
    console.error(`${logPrefix} Email integration not enabled`);
    throw new Error('Email integration not configured for this business');
  }
  
  if (!emailConfig.username || !emailConfig.password) {
    console.error(`${logPrefix} Missing SMTP credentials`);
    throw new Error('SMTP credentials not configured');
  }
  
  // Decrypt password
  const decryptedPassword = decrypt(emailConfig.password);
  
  if (decryptedPassword === null) {
    console.error(`${logPrefix} ❌ Decryption failed for SMTP password.`);
    throw new Error('CORRUPT_CREDENTIALS: Your password could not be decrypted. Please re-type and save it in settings.');
  }

  // FORCE Hostinger - Ignore Titan or other defaults if it's supposed to be Hostinger
  const host = (emailConfig.host && !emailConfig.host.includes('titan')) 
    ? emailConfig.host 
    : 'smtp.hostinger.com';

  console.log(`${logPrefix} SMTP Configuration:`);
  console.log(`${logPrefix}   - Host: ${host}`);
  console.log(`${logPrefix}   - Port: ${emailConfig.port || 465}`);
  console.log(`${logPrefix}   - Secure: true`);
  console.log(`${logPrefix}   - Username: ${emailConfig.username}`);
  console.log(`${logPrefix}   - Pass Length: ${decryptedPassword.length} chars`);
  
  const transporter = nodemailer.createTransport({
    host: host,
    port: emailConfig.port || 465,
    secure: true,
    auth: {
      user: emailConfig.username,
      pass: decryptedPassword
    },
    // Hostinger specific hardening
    requireTLS: true,
    authMethod: 'LOGIN',
    name: emailConfig.username.split('@')[1] || 'hostinger.com',
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    timeout: 10000, // Reduced to 10s for faster feedback
    pool: false
  });
  
  console.log(`${logPrefix} Transporter created successfully`);
  
  return transporter;
}

/**
 * Send email using business's own Hostinger credentials
 * @param {Object} business - The business document
 * @param {Object} mailOptions - Email options (to, subject, html, text)
 * @returns {Object} - { success: boolean, messageId?: string, error?: string }
 */
export async function sendBusinessEmail(business, mailOptions) {
  const logPrefix = `[BusinessEmail:${business.businessName}]`;
  
  try {
    console.log(`${logPrefix} ========== EMAIL SEND START ==========`);
    console.log(`${logPrefix} Recipient: ${mailOptions.to}`);
    console.log(`${logPrefix} Subject: ${mailOptions.subject}`);
    
    // Create transporter for this business
    const transporter = await createBusinessMailer(business);
    
    // Get sender details from business config
    const emailConfig = business.integrationCredentials?.email;
    const fromEmail = emailConfig.fromEmail || emailConfig.username;
    const fromName = emailConfig.fromName || business.businessName;
    
    // Prepare final mail options
    const finalMailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text || mailOptions.html?.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    console.log(`${logPrefix} Sending email from: ${finalMailOptions.from}`);
    console.log(`${logPrefix} Calling Nodemailer sendMail...`);
    
    // Send email
    const info = await transporter.sendMail(finalMailOptions);
    
    console.log(`${logPrefix} ✅ EMAIL SENT SUCCESSFULLY`);
    console.log(`${logPrefix}   - Message ID: ${info.messageId}`);
    console.log(`${logPrefix}   - Response: ${info.response}`);
    console.log(`${logPrefix} ========== EMAIL SEND END ==========\n`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
    
  } catch (error) {
    console.error(`${logPrefix} ❌ EMAIL SEND FAILED`);
    console.error(`${logPrefix}   - Error: ${error.message}`);
    console.error(`${logPrefix}   - Code: ${error.code}`);
    console.error(`${logPrefix}   - Stack: ${error.stack}`);
    console.log(`${logPrefix} ========== EMAIL SEND END (ERROR) ==========\n`);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Verify SMTP connection for a business
 * @param {Object} business - The business document
 * @returns {Object} - { success: boolean, error?: string }
 */
export async function verifyBusinessSMTP(business) {
  const logPrefix = `[SMTPVerify:${business.businessName}]`;
  
  try {
    console.log(`${logPrefix} Verifying SMTP connection...`);
    
    const transporter = await createBusinessMailer(business);
    
    console.log(`${logPrefix} Calling transporter.verify()...`);
    await transporter.verify();
    
    console.log(`${logPrefix} ✅ SMTP VERIFICATION SUCCESSFUL`);
    
    return { success: true };
    
  } catch (error) {
    console.error(`${logPrefix} ❌ SMTP VERIFICATION FAILED`);
    console.error(`${logPrefix}   - Error: ${error.message}`);
    console.error(`${logPrefix}   - Code: ${error.code}`);
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}
