import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { withRateLimit } from '@/lib/rateLimit';
import { evaluatePassword } from '@/lib/security/passwordPolicy';

async function resetPasswordHandler(req) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'Reset token required' }, { status: 400 });
    }

    await dbConnect();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpiresAt +email');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Same policy as signup — reset must not be a weaker gate. Pass email
    // as context so "prefix in password" checks work.
    const pwCheck = evaluatePassword(password, { email: user.email });
    if (!pwCheck.ok) {
      return NextResponse.json({
        success: false,
        error: pwCheck.failures[0]?.message || 'Password does not meet security requirements.',
        passwordFailures: pwCheck.failures,
      }, { status: 400 });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // Revoke all refresh tokens — active sessions must re-authenticate
    try {
      const RefreshToken = (await import('@/models/access/RefreshToken')).default;
      await RefreshToken.revokeAllForUser(user._id);
    } catch (err) {
      console.warn('[Reset Password] Failed to revoke refresh tokens:', err.message);
    }

    return NextResponse.json({ success: true, message: 'Password updated. Please sign in.' });
  } catch (error) {
    console.error('[Reset Password]', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export const POST = withRateLimit(5, 60, resetPasswordHandler);
