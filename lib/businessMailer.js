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
    port: 587, // Force 587 (STARTTLS) which is often more reliable than 465 in some environments
    secure: false, // Must be false for port 587
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
      minVersion: 'TLSv1.0'
    },
    timeout: 30000, // Increased to 30s to rule out network latency
    pool: false,
    logger: true, // Log SMTP exchanges
    debug: true   // Include debug info
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
/**
 * Send email using business's own Hostinger credentials with RETRY LOGIC
 * @param {Object} business - The business document
 * @param {Object} mailOptions - Email options (to, subject, html, text)
 * @returns {Object} - { success: boolean, messageId?: string, error?: string }
 */
export async function sendBusinessEmail(business, mailOptions) {
  const logPrefix = `[BusinessEmail:${business.businessName}]`;
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [0, 1000, 3000]; // 0ms, 1000ms, 3000ms

  console.log(`${logPrefix} [Email] START business=${business.businessName}`);
  console.log(`${logPrefix} [Email] To=${mailOptions.to}`);
  console.log(`${logPrefix} [Email] Subject=${mailOptions.subject}`);

  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let transporter = null;
    try {
      if (attempt > 0) {
        console.log(`${logPrefix} [Email] WAITING ${RETRY_DELAYS[attempt]}ms before retry attempt ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
      }

      console.log(`${logPrefix} [Email] Attempt ${attempt + 1}/${MAX_RETRIES}`);
      console.log(`${logPrefix} [Email] Loading SMTP credentials...`);
      
      // 1. Create fresh transporter (PER EMAIL SEND)
      transporter = await createBusinessMailer(business);
      
      const emailConfig = business.integrationCredentials?.email;
      const fromEmail = emailConfig.fromEmail || emailConfig.username;
      const fromName = emailConfig.fromName || business.businessName;
      
      const finalMailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text || mailOptions.html?.replace(/<[^>]*>/g, '')
      };

      console.log(`${logPrefix} [Email] Transporter created. Sending...`);

      // 2. STRICTLY await sendMail
      const info = await transporter.sendMail(finalMailOptions);

      console.log(`${logPrefix} [Email] SUCCESS messageId=${info.messageId}`);
      console.log(`${logPrefix} [Email] Response=${info.response}`);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };

    } catch (error) {
      lastError = error;
      console.warn(`${logPrefix} [Email] ERROR attempt ${attempt + 1}: ${error.message}`);
      
      if (error.code === 'EAUTH') {
        // Auth errors won't be fixed by retrying usually, but we stick to the plan of retrying network blips
        console.error(`${logPrefix} [Email] CRITICAL: SMTP Authentication Failed.`);
      }
    } finally {
      // 3. Dispose transporter (if possible/needed, though pool:false implies connection close on finish usually)
      // Nodemailer with pool:false closes connection automatically after send, but if we want to be explicit:
      if (transporter) {
        // No explicit dispose needed for non-pooled, but ensuring variable is cleared
        transporter = null;
      }
    }
  }

  // 4. Fail HARD after retries
  console.error(`${logPrefix} [Email] FAILED after ${MAX_RETRIES} attempts.`);
  console.error(`${logPrefix} [Email] Final Error: ${lastError?.message}`);
  
  throw new Error(`Email failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
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
