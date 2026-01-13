import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import { callTelephonyProvider } from '@/lib/call-automation/providers/call_telephony.provider';

/**
 * POST /api/automation/call-integration/test
 * Initiates a real outbound test call to verify Twilio credentials and outbound connectivity.
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { businessId, testNumber } = body;

    if (!businessId || !testNumber) {
      return NextResponse.json({ error: 'businessId and testNumber are required' }, { status: 400 });
    }

    console.log(`[API] Test call requested for business ${businessId} to ${testNumber}`);

    // Place a real outbound call using the telephony provider
    // We use a standard Twilio demo URL for the test call voice flow.
    // In production, this would be a custom TwiML endpoint on our server.
    const testScriptUrl = 'http://demo.twilio.com/docs/voice.xml';
    
    const result = await callTelephonyProvider.makeAiCall(
      testNumber, 
      null, // Provider will fetch 'from' number from DB
      testScriptUrl, 
      businessId
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test call initiated successfully! Your phone should ring shortly.', 
        callSid: result.callSid 
      });
    } else {
      let errorMsg = result.error || 'Failed to initiate test call. Check your Twilio credentials and phone number.';
      
      // Providing specific hints for common Twilio Trial errors
      if (errorMsg.includes('unverified')) {
        errorMsg += " (TIP: Since you are using a Twilio Trial account, you must verify YOUR phone number in the Twilio Console under 'Verified Caller IDs' before you can receive test calls.)";
      }

      return NextResponse.json({ 
        success: false, 
        error: errorMsg
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[API] Test Call Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
