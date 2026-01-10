import nodemailer from 'nodemailer';

/**
 * Creates a transporter for LeadForGrow onboarding emails
 * Uses sales@leadforgrow.online
 */
const createOnboardingTransporter = () => {
  const transporterConfig = {
    host: process.env.SMTP_HOST || 'smtp.titan.email',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'sales@leadforgrow.online',
      pass: process.env.SMTP_PASSWORD
    },
    name: 'leadforgrow.online',
    authMethod: 'LOGIN',
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  };

  return nodemailer.createTransport(transporterConfig);
};

/**
 * Send onboarding confirmation email to user
 */
export const sendUserConfirmationEmail = async (userName, userEmail, meetLink) => {
  try {
    const transporter = createOnboardingTransporter();
    const firstName = userName?.split(' ')[0] || 'there';

    const mailOptions = {
      from: '"LeadForGrow Team" <sales@leadforgrow.online>',
      to: userEmail,
      subject: 'Your LeadForGrow Setup Call (5 min)',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">LeadForGrow</h1>
          </div>
          
          <h2 style="color: #1F2937; font-size: 24px; margin-bottom: 20px;">Your Setup Call is Ready! 🎉</h2>
          
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${firstName},
          </p>
          
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Thanks for taking the first step. Someone from our team will join you within 3 minutes!
          </p>
          
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Click below to join the instant call:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${meetLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
              👉 Join Call Now (Team will join in 3 min)
            </a>
          </div>
          
          <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We'll understand your lead flow and help you set things up — <strong>no payment required to talk</strong>.
          </p>
          
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              See you soon,<br>
              <strong>Team LeadForGrow</strong>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
            <p style="color: #6B7280; font-size: 13px; margin: 0; line-height: 1.5;">
              <strong>Meeting Link:</strong><br>
              <a href="${meetLink}" style="color: #4F46E5; word-break: break-all;">${meetLink}</a>
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Onboarding] User confirmation sent to ${userEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Onboarding] Failed to send user confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send internal team notification
 */
export const sendInternalNotification = async (userName, userEmail, userPhone, meetLink, planId = null) => {
  try {
    const transporter = createOnboardingTransporter();
    const firstName = userName?.split(' ')[0] || 'Unknown';
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const internalEmails = [
      'sales@leadforgrow.online',
      'saurabhiitr01@gmail.com',
      'himanshu.2212.singh@gmail.com',
      'singhriya33690@gmail.com'
    ];

    const mailOptions = {
      from: '"LeadForGrow System" <sales@leadforgrow.online>',
      to: internalEmails.join(', '),
      subject: `🔔 New Setup Call Scheduled – ${firstName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">New Onboarding Call Scheduled</h2>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong style="color: #374151;">Name:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB; color: #1F2937;">
                  ${userName || 'N/A'}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong style="color: #374151;">Email:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB; color: #1F2937;">
                  <a href="mailto:${userEmail}" style="color: #4F46E5;">${userEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong style="color: #374151;">Phone:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB; color: #1F2937;">
                  ${userPhone || 'N/A'}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong style="color: #374151;">Meet Link:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <a href="${meetLink}" style="color: #4F46E5; word-break: break-all;">${meetLink}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong style="color: #374151;">Scheduled:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB; color: #1F2937;">
                  ${timestamp}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <strong style="color: #374151;">Status:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                  <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    PRE-PAYMENT
                  </span>
                </td>
              </tr>
              ${planId ? `
              <tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #374151;">Interested Plan:</strong>
                </td>
                <td style="padding: 12px 0; color: #1F2937;">
                  ${planId}
                </td>
              </tr>
              ` : ''}
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${meetLink}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Join Meeting
              </a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Onboarding] Internal notification sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Onboarding] Failed to send internal notification:', error);
    return { success: false, error: error.message };
  }
};
