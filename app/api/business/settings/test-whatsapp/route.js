import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';

/**
 * POST /api/business/settings/test-whatsapp
 * Tests and verifies Interakt WhatsApp API connection
 */
export const POST = withPlanAccess('settings', async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const { whatsappSettings, testPhone } = await req.json();
    const provider = whatsappSettings.provider || 'meta';

    if (testPhone) {
      // 0. Send a real test message
      console.log(`[TestWhatsApp] Sending real test message to ${testPhone} via ${provider}`);
      const { sendAutoWhatsApp } = await import('@/lib/integrations/whatsapp');
      
      // Mock lead for test
      const testLead = { name: 'Test User', phone: testPhone, whatsapp: testPhone };
      // Mock business for test (pass settings directly)
      const mockBusiness = { 
        businessName: 'Test Business', 
        integrationCredentials: { whatsapp: { ...whatsappSettings, enabled: true } } 
      };

      const testResult = await sendAutoWhatsApp(testLead, mockBusiness, 'This is a test message from LeadForGrow! If you see this, your integration is working correctly. ✅');
      
      if (testResult.success) {
        return NextResponse.json({ 
          success: true, 
          message: `Test message sent to ${testPhone}. Please check your WhatsApp!`,
          data: testResult
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: `MESSAGE FAILED: ${testResult.error || 'Check your credentials or Meta Sandbox restrictions.'}`,
          details: testResult
        }, { status: 400 });
      }
    }

    if (provider === 'meta') {
      // 1. Validate Meta Cloud API
      if (!whatsappSettings.apiKey || !whatsappSettings.phoneNumberId) {
        return NextResponse.json({
          success: false,
          error: 'Meta API Key and Phone Number ID are required.'
        }, { status: 400 });
      }

      console.log(`[TestWhatsApp] Testing Meta API for business ID: ${user.businessId}`);
      
      try {
        // Test Meta API by calling the phone number ID endpoint
        const response = await fetch(`https://graph.facebook.com/v21.0/${whatsappSettings.phoneNumberId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${whatsappSettings.apiKey}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          return NextResponse.json({
            success: false,
            error: `META AUTH FAILED: ${data.error?.message || 'Invalid credentials'}`
          }, { status: response.status });
        }

        return await markSuccess(user.businessId, whatsappSettings, 'meta');

      } catch (fetchError) {
        return NextResponse.json({ success: false, error: 'CONNECTION ERROR: Unable to reach Meta API.' }, { status: 500 });
      }

    } else {
      // 2. Validate Interakt API
      if (!whatsappSettings.interaktApiKey) {
        return NextResponse.json({
          success: false,
          error: 'Interakt API Key is required for validation.'
        }, { status: 400 });
      }

      const apiKey = whatsappSettings.interaktApiKey.trim();
      console.log(`[TestWhatsApp] Testing Interakt API for business ID: ${user.businessId}`);
      const authHeader = `Basic ${apiKey}`;

      try {
        const response = await fetch('https://api.interakt.ai/v1/public/track/users/', {
          method: 'POST',
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (response.status === 401) {
          return NextResponse.json({ success: false, error: 'AUTHENTICATION FAILED: Invalid Interakt key.' }, { status: 401 });
        }

        if (response.ok || response.status === 400 || response.status === 202) {
          return await markSuccess(user.businessId, whatsappSettings, 'interakt');
        }

        return NextResponse.json({ success: false, error: `Interakt Failed: Status ${response.status}` }, { status: response.status });
      } catch (e) {
        return NextResponse.json({ success: false, error: 'CONNECTION ERROR: Interakt unreachable.' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('[TestWhatsApp Error]:', error);
    return NextResponse.json({ success: false, error: 'Unexpected error: ' + error.message }, { status: 500 });
  }
});

async function markSuccess(businessId, settings, provider) {
  const business = await Business.findById(businessId);
  if (business) {
    business.set('integrationHealth.whatsapp', {
      status: 'healthy',
      lastSuccessAt: new Date(),
      lastError: null
    });

    const existingWhatsapp = business.integrationCredentials?.whatsapp || {};
    business.set('integrationCredentials.whatsapp', {
      ...existingWhatsapp,
      ...settings,
      enabled: true,
      provider,
      lastVerified: new Date()
    });

    business.markModified('integrationHealth');
    business.markModified('integrationCredentials');
    await business.save();
  }

  return NextResponse.json({
    success: true,
    message: `${provider === 'meta' ? 'Meta' : 'Interakt'} connection verified successfully!`
  });
}
