import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import { initiateTwilioPhoneNumberVerification } from '@/lib/call-automation/providers/twilio_validator';
import { decrypt } from '@/lib/encryption';
import Business from '@/models/Business';
import { normalizePhoneNumber } from '@/lib/phone_normalization';

/**
 * POST /api/automation/call-integration/verify-phone
 * Initiates a phone verification request for a Twilio trial account.
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { businessId, phoneNumber } = body;

    if (!businessId || !phoneNumber) {
      return NextResponse.json({ error: 'businessId and phoneNumber are required' }, { status: 400 });
    }

    // 1. Fetch encrypted credentials
    const business = await Business.findById(businessId).select('+settings.callAutomation.telephony.apiKey');
    const config = business?.settings?.callAutomation?.telephony;

    if (!config || config.provider !== 'twilio') {
      return NextResponse.json({ error: 'Only Twilio provider supports direct verification' }, { status: 400 });
    }

    // 2. Decrypt Auth Token
    let apiKey = config.apiKey;
    if (apiKey && apiKey.includes(':')) {
      apiKey = decrypt(apiKey);
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Twilio Auth Token missing' }, { status: 400 });
    }

    // 3. Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    console.log(`[API] Initiating verification for ${normalizedPhone} on account ${config.assistantId}`);

    // 4. Trigger Twilio Verification
    const result = await initiateTwilioPhoneNumberVerification(
      config.assistantId, 
      apiKey, 
      normalizedPhone
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        validationCode: result.validationCode,
        alreadyVerified: result.alreadyVerified,
        message: result.alreadyVerified 
          ? 'This number is already verified in your Twilio account!' 
          : 'Verification call initiated. Please answer your phone and enter the code provided.'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[API] Verify Phone Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
