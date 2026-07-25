import { NextResponse } from 'next/server';

/**
 * Simple test endpoint to confirm Meta can reach this server.
 * Use URL: https://lfg-v2.vercel.app/api/webhooks/meta/test
 */

// GET - Webhook verification
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('[Meta Test Endpoint] GET received');
    console.log('[Meta Test Endpoint] mode:', mode);
    console.log('[Meta Test Endpoint] token:', token);
    console.log('[Meta Test Endpoint] challenge:', challenge);

    // Diagnostic endpoint: disabled in production
    if (process.env.NODE_ENV === 'production') {
        return new Response('Not found', { status: 404 });
    }

    // Accept ANY verify token for testing purposes (dev only)
    if (mode === 'subscribe' && challenge) {
        console.log('[Meta Test Endpoint] ✅ Returning challenge');
        return new Response(challenge, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }

    return new Response('ok', { status: 200 });
}

// POST - Receive events
export async function POST(request) {
    if (process.env.NODE_ENV === 'production') {
        return new Response('Not found', { status: 404 });
    }
    const rawBody = await request.text();
    console.log('[Meta Test Endpoint] ✅ POST received!');
    console.log('[Meta Test Endpoint] Headers:', JSON.stringify(Object.fromEntries(request.headers)));
    console.log('[Meta Test Endpoint] Body:', rawBody);
    return NextResponse.json({ success: true, received: true });
}
