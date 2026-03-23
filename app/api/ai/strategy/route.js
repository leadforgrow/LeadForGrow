import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch('http://localhost:5055/ai/growth-strategy', {
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
}
