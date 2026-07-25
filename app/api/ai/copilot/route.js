import { NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth';

export const POST = withTenantAuth(async (request) => {
  try {
    const body = await request.json();

    // Call Production Python Backend
    const response = await fetch('https://lfg-v2.onrender.com/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Bridge Error:', error);
    return NextResponse.json({ success: false, error: 'AI Backend unreachable' }, { status: 500 });
  }
});
