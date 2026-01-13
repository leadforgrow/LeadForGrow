import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { callController } from '@/lib/call-automation/call_controller';

/**
 * POST /api/automation/webhook/twilio/callback-response
 * Handles the state machine for the professional AI callback conversation.
 * States: init -> name -> reason -> time -> end
 */
export async function POST(req) {
  try {
    await dbConnect();
    
    // Parse query params for state management
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state') || 'init';
    const missedCallId = searchParams.get('missedCallId');
    const businessId = searchParams.get('businessId');
    const nameCaptured = searchParams.get('name') || '';
    const reasonCaptured = searchParams.get('reason') || '';

    // Parse Twilio's form data
    const formData = await req.formData();
    const twilioData = Object.fromEntries(formData.entries());
    const speechResult = twilioData.SpeechResult || '';
    const callSid = twilioData.CallSid;

    console.log(`[AI Callback Webhook] State: ${state}, CallSid: ${callSid}`);

    // Fetch business details for personalization
    const business = await Business.findById(businessId);
    if (!business) {
      console.error(`[AI Callback Webhook] Business not found: ${businessId}`);
      return new Response('<Response><Hangup/></Response>', { headers: { 'Content-Type': 'text/xml' } });
    }
    const businessName = business.businessName;
    
    // Base URL for the next step in the conversation
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}/api/automation/webhook/twilio/callback-response`;

    let responseTwiML = '';

    switch (state) {
      case 'init':
        responseTwiML = `
          <Response>
            <Say voice="Polly.Amy">Hello, I am the AI assistant for ${businessName}. I'm calling you back because we missed your call. May I have your name, please?</Say>
            <Gather input="speech" action="${baseUrl}?state=name&amp;missedCallId=${missedCallId}&amp;businessId=${businessId}" timeout="3" speechTimeout="auto">
            </Gather>
            <Say voice="Polly.Amy">I'm sorry, I didn't catch your name. But don't worry, we'll have someone call you back soon. Goodbye!</Say>
            <Hangup/>
          </Response>
        `;
        break;

      case 'name':
        responseTwiML = `
          <Response>
            <Say voice="Polly.Amy">Thank you, ${speechResult || 'there'}. What was the reason for your call today?</Say>
            <Gather input="speech" action="${baseUrl}?state=reason&amp;missedCallId=${missedCallId}&amp;businessId=${businessId}&amp;name=${encodeURIComponent(speechResult)}" timeout="3" speechTimeout="auto">
            </Gather>
            <Say voice="Polly.Amy">I'm sorry, I missed that. But we've got your number and will call you back. Goodbye!</Say>
            <Hangup/>
          </Response>
        `;
        break;

      case 'reason':
        responseTwiML = `
          <Response>
            <Say voice="Polly.Amy">I understand. And when is the best time for our team to call you back?</Say>
            <Gather input="speech" action="${baseUrl}?state=time&amp;missedCallId=${missedCallId}&amp;businessId=${businessId}&amp;name=${encodeURIComponent(nameCaptured)}&amp;reason=${encodeURIComponent(speechResult)}" timeout="3" speechTimeout="auto">
            </Gather>
            <Say voice="Polly.Amy">No problem. We will call you back during business hours. Thank you, goodbye!</Say>
            <Hangup/>
          </Response>
        `;
        break;

      case 'time':
        const timeCaptured = speechResult;
        console.log(`[AI Callback Webhook] Completed. Captured: Name=${nameCaptured}, Reason=${reasonCaptured}, Time=${timeCaptured}`);
        
        // Trigger the completion handler to create lead and notify business
        // We do this asynchronously to avoid blocking Twilio
        // Mocking the completion request
        fetch(`${protocol}://${host}/api/automation/call-integration/completion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            missedCallId,
            businessId,
            name: nameCaptured,
            reason: reasonCaptured,
            preferredTime: timeCaptured,
            callSid
          })
        }).catch(err => console.error('[AI Callback Webhook] Error triggering completion:', err));

        responseTwiML = `
          <Response>
            <Say voice="Polly.Amy">Perfect. We've noted your request and one of our experts will call you back at ${timeCaptured || 'the requested time'}. Have a wonderful day!</Say>
            <Hangup/>
          </Response>
        `;
        break;

      default:
        responseTwiML = '<Response><Hangup/></Response>';
    }

    return new Response(responseTwiML.trim(), {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error('[AI Callback Webhook] Critical Error:', error);
    return new Response('<Response><Say>Sorry, we encountered a technical issue. Goodbye.</Say><Hangup/></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
