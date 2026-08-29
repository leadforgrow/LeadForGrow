import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { withRateLimit } from '@/lib/rateLimit';
import { evaluatePassword } from '@/lib/security/passwordPolicy';

/**
 * POST /api/auth/rotate-password
 *
 * Force-rotate endpoint used when a user's grandfathered-in weak password
 * trips the login-time policy check. Requires the current password
 * (re-verified via bcrypt) plus a new password that satisfies the policy.
 *
 * On success:
 *   - hashes and stores the new password
 *   - clears mustRotatePassword + stamps passwordUpdatedAt
 *   - revokes all other refresh tokens so any stolen session dies with the
 *     old password (defence-in-depth — the user asked to rotate for a reason)
 *
 * Rate-limited to 5/min per IP to slow bulk credential-stuffing attempts.
 */
async function rotateHandler(req) {
  try {
    await dbConnect();
    const { userId } = req.user || {};
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Current and new password are required' }, { status: 400 });
    }

    // Fetch full doc — mixing `+password` with a comma-less field list in
    // Mongoose used to work but is finicky; safer to fetch everything and
    // let the code below just use what it needs.
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (user.authProvider === 'google' || !user.password) {
      return NextResponse.json({ success: false, error: 'Google-authenticated accounts have no password to rotate' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
    }

    // New password must clear the current policy AND differ from the old one
    // (rotating to the same weak password would defeat the purpose).
    if (currentPassword === newPassword) {
      return NextResponse.json({ success: false, error: 'New password must be different from the current one' }, { status: 400 });
    }
    const pwCheck = evaluatePassword(newPassword, { email: user.email });
    if (!pwCheck.ok) {
      return NextResponse.json({
        success: false,
        error: pwCheck.failures[0]?.message || 'Password does not meet security requirements.',
        passwordFailures: pwCheck.failures,
      }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustRotatePassword = false;
    user.passwordUpdatedAt = new Date();
    await user.save();

    // Revoke other sessions — anything holding the old password is compromised
    // by definition (the reason we forced rotation). Best-effort: don't block
    // rotation success if refresh-token revocation errors.
    try {
      const RefreshToken = (await import('@/models/access/RefreshToken')).default;
      await RefreshToken.revokeAllForUser(user._id);
    } catch (err) {
      console.warn('[Rotate Password] Failed to revoke refresh tokens:', err.message);
    }

    return NextResponse.json({ success: true, message: 'Password updated. Please sign in again with your new password.' });
  } catch (error) {
    // Endpoint is authenticated so leaking the specific error message to the
    // caller is safe (only the user themselves can trigger this path). Makes
    // 500s debuggable from DevTools without needing Vercel log access.
    console.error('[Rotate Password]', error);
    return NextResponse.json({
      success: false,
      error: 'Password update failed',
      detail: error?.message || String(error),
      where: error?.stack?.split('\n')[1]?.trim() || null,
    }, { status: 500 });
  }
}

export const POST = withRateLimit(5, 60, withAuth()(rotateHandler));
