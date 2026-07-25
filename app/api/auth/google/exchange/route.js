import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import OAuthExchange from '@/models/access/OAuthExchange';
import { withRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/auth/google/exchange
 * Swap a one-time OAuth exchange code for the session payload (single use).
 */
async function exchangeHandler(req) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Exchange code required' }, { status: 400 });
    }

    await dbConnect();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const doc = await OAuthExchange.findOneAndDelete({
      codeHash,
      expiresAt: { $gt: new Date() },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Sign-in link expired. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: doc.payload });
  } catch (error) {
    console.error('[Google OAuth] exchange error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export const POST = withRateLimit(20, 60, exchangeHandler);
