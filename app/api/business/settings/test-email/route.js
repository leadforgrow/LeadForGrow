import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { withPlanAccess } from '@/lib/accessControl';

/**
 * POST - Test SMTP connection with the latest Titan-Harden parameters
 */
export async function POST(request) {
  return withPlanAccess(request, 'settings', async (req, user) => {
    try {
      const body = await request.json();
      const { host, port, username, password } = body;

      if (!host || !port || !username || !password) {
        return NextResponse.json({ 
          success: false, 
          error: 'All credentials (Host, Port, User, Pass) are required.' 
        }, { status: 400 });
      }

      // Check for invisible characters or spaces (Common mistake)
      const hasSpaces = password.startsWith(' ') || password.endsWith(' ');
      const hasControlChars = /[\x00-\x1F\x7F]/.test(password);
      
      if (hasSpaces || hasControlChars) {
        return NextResponse.json({
          success: false,
          error: `CREDENTIALS ERROR: Your password has ${hasSpaces ? 'invisible spaces' : 'hidden symbols'} at the ends. Please re-type it manually to fix this.`,
          code: 'INVALID_CREDENTIALS'
        }, { status: 400 });
      }

      // Standardized Titan-Hardened Config
      const transporter = nodemailer.createTransport({
        host: host.trim(),
        port: Number(port),
        secure: Number(port) === 465,
        auth: {
          user: username.trim(),
          pass: password
        },
        name: username.split('@')[1] || 'leadforgrow.online',
        authMethod: 'LOGIN',
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        timeout: 20000,
        debug: true,
        logger: true
      });

      try {
        console.log(`[SMTP Test] Verifying identity for ${username}...`);
        await transporter.verify();
        
        // Success Email
        await transporter.sendMail({
          from: `"LeadForGrow ✅" <${username.trim()}>`,
          to: username.trim(),
          subject: 'LeadForGrow: Connection Verified! 🚀',
          html: `<div style="font-family: sans-serif; padding: 24px; border: 4px solid #10b981; border-radius: 20px;">
                  <h1 style="color: #10b981;">It Worked! 🚀</h1>
                  <p>Your SMTP settings for <b>${host}</b> are now verified.</p>
                  <p>Automation is ready to go!</p>
                 </div>`
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Connection Successful! A test email has been sent to your inbox.' 
        });

      } catch (verifyError) {
        console.error('[SMTP Test Error Details]:', verifyError);
        
        let errorMsg = verifyError.message;
        if (verifyError.code === 'EAUTH') {
          errorMsg = 'AUTHENTICATION FAILED: The server rejected your login. Please double-check your password and ensure "Third-party app access" is enabled in your Titan dashboard.';
        } else if (verifyError.code === 'ESOCKET') {
          errorMsg = 'NETWORK TIMEOUT: Server is not responding. Try switching to Port 587.';
        }

        return NextResponse.json({ 
          success: false, 
          error: errorMsg,
          code: verifyError.code
        }, { status: 401 });
      }

    } catch (globalError) {
      console.error('[Global SMTP Test Error]:', globalError);
      return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
  });
}
