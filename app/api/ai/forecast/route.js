import { NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth';

export const POST = withTenantAuth(async (request) => {
  try {
    const body = await request.json();
    const response = await fetch('https://lfg-v2.onrender.com/ai/predictive-forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'AI Backend unreachable' }, { status: 500 });
  }
});
