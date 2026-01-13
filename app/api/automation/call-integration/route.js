import { NextResponse } from 'next/server';
import { callController } from '@/lib/call-automation/call_controller';
import { dbConnect } from "@/lib/mongodb";
import { encrypt } from '@/lib/encryption';
import { validateTwilioCredentials, validateTwilioPhoneNumber } from '@/lib/call-automation/providers/twilio_validator';
import Business from '@/models/Business';

/**
 * Bridge for Call Automation Webhook
 * POST /api/automation/call-integration
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log('[API] POST /api/automation/call-integration - Webhook received');
    console.log('[API] Request body:', JSON.stringify(body, null, 2));
    
    // Mocking the req/res for the controller since it was written with Express style
    // but we can just call the service logic directly if we want cleaner integration
    // For now, we'll bridge it simply.
    
    const mockRes = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    const result = await callController.handleWebhook({ body }, mockRes);
    console.log('[API] Webhook processing completed:', result.status);
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('[API] Call Integration Error:', error);
    console.error('[API] Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

/**
 * Handle configuration changes and status checks
 */
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

    const [usage, settings, business] = await Promise.all([
      callController.getUsageInfo(businessId, currentMonth),
      callController.getSettings(businessId),
      Business.findById(businessId).select('quotas')
    ]);
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        ...(usage?._doc || {}), 
        settings,
        quotas: business?.quotas
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handle Phone Connection
 */
export async function PATCH(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log('[API] PATCH /api/automation/call-integration Body:', JSON.stringify(body, null, 2));

    const businessId = body.businessId;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    let result;
    if (body.settings) {
      // 1. Handle Twilio Credential Validation & Encryption
      if (body.settings.telephony?.provider === 'twilio') {
        const { apiKey, assistantId, phoneNumberId } = body.settings.telephony;
        
        // Only validate and encrypt if a NEW apiKey is provided
        // We assume it's new if it doesn't match our encryption format (does not contain ':')
        if (apiKey && apiKey.trim() !== '' && !apiKey.includes(':')) {
           console.log('[API] Validating new Twilio credentials...');
           const credValidation = await validateTwilioCredentials(assistantId, apiKey);
           if (!credValidation.success) {
             return NextResponse.json({ success: false, error: credValidation.error || 'Invalid Twilio credentials' }, { status: 400 });
           }
           
           const phoneValidation = await validateTwilioPhoneNumber(assistantId, apiKey, phoneNumberId);
           if (!phoneValidation.success) {
             return NextResponse.json({ success: false, error: phoneValidation.error || 'Invalid Twilio phone number' }, { status: 400 });
           }
           
           // Encrypt before saving
           body.settings.telephony.apiKey = encrypt(apiKey);
           console.log('[API] Twilio credentials validated and encrypted.');
        } 
        // If apiKey is missing or empty, preserve the existing one by fetching it first
        else if (!apiKey || apiKey.trim() === '') {
           const existingBusiness = await Business.findById(businessId).select('+settings.callAutomation.telephony.apiKey');
           if (existingBusiness?.settings?.callAutomation?.telephony?.apiKey) {
             body.settings.telephony.apiKey = existingBusiness.settings.callAutomation.telephony.apiKey;
           }
        }
      }

      result = await callController.updateSettings(businessId, body.settings);
    } else if (body.phone) {
       result = await callController.connectPhone(businessId, currentMonth, body.phone);
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] Call Integration Patch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
