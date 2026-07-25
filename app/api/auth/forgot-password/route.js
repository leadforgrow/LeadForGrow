import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { withRateLimit } from '@/lib/rateLimit';
import { sendResendEmail } from '@/lib/resend';
import { getEnv } from '@/lib/env';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function forgotPasswordHandler(req) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    // Response is identical whether the account exists or not (no enumeration)
    const genericResponse = NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });

    await dbConnect();
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.authProvider === 'google') {
      return genericResponse;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const appUrl = getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendResendEmail({
      to: user.email,
      subject: 'Reset your LeadForGrow password',
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a;">Reset your password</h1>
          <p style="font-size: 15px; color: #475569;">We received a request to reset your LeadForGrow password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #059669; color: #ffffff; border-radius: 12px; font-weight: 700; text-decoration: none;">Reset password</a>
          <p style="font-size: 13px; color: #94a3b8;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
        </div>
      `,
      text: `Reset your LeadForGrow password: ${resetUrl} (expires in 1 hour). If you didn't request this, ignore this email.`,
    });

    return genericResponse;
  } catch (error) {
    console.error('[Forgot Password]', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export const POST = withRateLimit(5, 60, forgotPasswordHandler);
