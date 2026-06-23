import { NextResponse } from 'next/server';

/** Forgot password — architecture ready for email provider integration */
export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }
    // TODO: generate token, store hash, send email via business mailer
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
