import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import { callController } from '@/lib/call-automation/call_controller';
import Business from '@/models/Business';

/**
 * POST /api/automation/webhook/twilio/incoming
 * Twilio Voice Webhook handler. Detects missed calls and initiates recover flow.
 */
export async function POST(req) {
  try {
    await dbConnect();
    
    // Twilio sends data in x-www-form-urlencoded format
    const formData = await req.formData();
    const twilioData = Object.fromEntries(formData.entries());
    
    const { CallSid, From, To, CallStatus, Direction } = twilioData;
    
    console.log(`[Twilio Webhook] Incoming call ${CallSid} from ${From} to ${To} (Status: ${CallStatus})`);

    if (Direction !== 'inbound') {
      return new Response('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
    }

    // 1. Find the business associated with this Twilio number
    const business = await Business.findOne({ 
      'settings.callAutomation.telephony.phoneNumberId': To,
      'settings.callAutomation.enabled': true
    });
    
    if (!business) {
      console.warn(`[Twilio Webhook] No active business found for Twilio number: ${To}`);
      return new Response('<Response><Say>This number is not correctly configured.</Say><Hangup/></Response>', {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // 2. Trigger the missed call detection logic
    // We pass the twilioData as metadata for future reference
    // This will create a CallMissed record and initiate the AI callback if eligible.
    const result = await callController.handleWebhook({
      body: {
        businessId: business._id,
        callerNumber: From,
        payload: { source: 'twilio_webhook', twilioData }
      }
    }, {
      status: (code) => ({
        json: (data) => {
          console.log(`[Twilio Webhook] Controller result: ${code}`, data);
          return { code, data };
        }
      })
    });

    // 3. Respond to Twilio with TwiML
    // Since we're in "Missed Call Detection" mode, we typically want to let the call ring 
    // or handle it with an answering message. 
    // Requirement says: "Ask ONLY: Name, Reason, Callback time" - that's for the CALLBACK.
    // For the INCOMING call, we just say we'll call back.
    
    const responseTwiML = `
      <Response>
        <Say voice="Polly.Amy">Hello, thanks for calling ${business.businessName}. We're sorry we missed your call. An AI assistant will call you back in a moment to help you.</Say>
        <Pause length="1"/>
        <Hangup/>
      </Response>
    `.trim();

    return new Response(responseTwiML, {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('[Twilio Webhook] Critical Error:', error);
    return new Response('<Response><Say>We are currently experiencing technical difficulties. Please try again later.</Say><Hangup/></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
