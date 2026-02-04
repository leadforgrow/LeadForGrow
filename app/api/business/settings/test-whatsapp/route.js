import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';

/**
 * POST /api/business/settings/test-whatsapp
 * Tests and verifies Interakt WhatsApp API connection
 */
export async function POST(request) {
  return withPlanAccess(request, 'settings', async (req, user) => {
    try {
      await dbConnect();
      const { whatsappSettings } = await request.json();

      if (!whatsappSettings.interaktApiKey) {
        return NextResponse.json({ 
          success: false, 
          error: 'Interakt API Key is required for validation.' 
        }, { status: 400 });
      }

      const apiKey = whatsappSettings.interaktApiKey.trim();

      console.log(`[TestWhatsApp] Testing Interakt API for business ID: ${user.businessId}`);

      // Interakt API validation
      // Interakt's Secret Key (API Key) is already a base64 encoded string.
      // We just need to prepend "Basic " to it.
      const authHeader = `Basic ${apiKey}`;

      try {
        const response = await fetch('https://api.interakt.ai/v1/public/track/users/', {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        });

        // Interakt's GET /track/users/ might not be supported (might be 405)
        // but if it's 401, then the API key is definitely wrong.
        // If it's 200, 202, 404, or 405, it means the auth was accepted.
        
        if (response.status === 401) {
          return NextResponse.json({ 
            success: false, 
            error: 'AUTHENTICATION FAILED: The Interakt API key is invalid.' 
          }, { status: 401 });
        }

        // To be sure, if it's 405 (Method Not Allowed), it still means the auth header was valid 
        // because usually auth is checked before method.
        // But let's try a safe POST if GET fails with 405.
        
        if (response.status === 405 || response.status === 404) {
             // Try a minimal POST to check if it's just the method/path
             // We don't want to actually create a user, so we'll send empty body
             const postResponse = await fetch('https://api.interakt.ai/v1/public/track/users/', {
                method: 'POST',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) 
              });
              
              if (postResponse.status === 401) {
                return NextResponse.json({ 
                  success: false, 
                  error: 'AUTHENTICATION FAILED: The Interakt API key is invalid.' 
                }, { status: 401 });
              }
              
              // 400 Bad Request is fine here because we sent an empty body, 
              // but it means the API key was accepted.
              if (postResponse.status === 200 || postResponse.status === 202 || postResponse.status === 400) {
                 return await markSuccess(user.businessId, apiKey);
              }
        }

        if (response.ok) {
          return await markSuccess(user.businessId, apiKey);
        }

        return NextResponse.json({ 
          success: false, 
          error: `Interakt Validation Failed: Received status ${response.status}` 
        }, { status: response.status });

      } catch (fetchError) {
        console.error('[TestWhatsApp Fetch Error]:', fetchError);
        return NextResponse.json({ 
          success: false, 
          error: 'CONNECTION ERROR: Unable to reach Interakt API servers.' 
        }, { status: 500 });
      }

    } catch (error) {
      console.error('[TestWhatsApp Error]:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Unexpected error during validation: ' + error.message 
      }, { status: 500 });
    }
  });
}

async function markSuccess(businessId, apiKey) {
    const business = await Business.findById(businessId);
    if (business) {
        // Use .set() for nested paths which is more reliable in Mongoose for subdocuments
        business.set('integrationHealth.whatsapp', {
            status: 'healthy',
            lastSuccessAt: new Date(),
            lastError: null
        });
        
        const existingWhatsapp = business.integrationCredentials?.whatsapp || {};
        business.set('integrationCredentials.whatsapp', {
            ...existingWhatsapp,
            enabled: true,
            provider: 'interakt',
            interaktApiKey: apiKey,
            lastVerified: new Date()
        });
        
        business.markModified('integrationHealth');
        business.markModified('integrationCredentials');
        
        await business.save();
    }
    
    return NextResponse.json({ 
        success: true, 
        message: 'Interakt API connection verified successfully!' 
    });
}
