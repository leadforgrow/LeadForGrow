import { NextResponse } from 'next/server';
import { callController } from '@/lib/call-automation/call_controller';
import { dbConnect } from "@/lib/mongodb";

/**
 * Endpoint for Live Inbound Calls (Forwarded from Personal SIM)
 * POST /api/automation/call-integration/inbound
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json({ error: 'businessId required in query string' }, { status: 400 });
    }

    // Adapt body for controller
    const mockReq = { 
      body: { 
        businessId,
        callerNumber: body.From || body.customer?.number || 'unknown',
        payload: body
      } 
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    const result = await callController.handleInboundCall(mockReq, mockRes);
    const { config, missedCallId } = result.data;

    // Return Provider-Specific Response
    if (body.AccountSid) {
      // Twilio TwiML
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Hello! We matched your call to our AI assistant. Please wait.</Say>
          <Connect>
            <Stream url="wss://${req.headers.get('host')}/api/automation/call-integration/stream?missedCallId=${missedCallId}" />
          </Connect>
        </Response>`;
      return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // Default Vapi / Generic JSON response
    return NextResponse.json({
      assistantId: config.telephony?.assistantId,
      customer: { number: mockReq.body.callerNumber },
      metadata: { missedCallId }
    });

  } catch (error) {
    console.error('[Inbound API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
