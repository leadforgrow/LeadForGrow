import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import User from '@/models/User';
import AutomationRule from '@/models/automation/AutomationRule';
import { fetchMetaTemplates } from '@/lib/whatsapp/templates';

/**
 * POST /api/automation/templates/sync
 * Syncs official Meta WhatsApp templates into the local library
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user || !user.businessId) {
      return NextResponse.json({ success: false, error: 'Business context not found' }, { status: 404 });
    }

    const business = await Business.findById(user.businessId).select('+integrationCredentials');
    const whatsappCreds = business.integrationCredentials?.whatsapp;

    if (!whatsappCreds?.apiKey || !whatsappCreds?.businessAccountId) {
      return NextResponse.json({ 
        success: false, 
        error: 'WhatsApp not fully configured. Please set API Key and Business Account ID in Integrations.' 
      }, { status: 400 });
    }

    const { decrypt } = await import('@/lib/encryption');
    const decryptedApiKey = decrypt(whatsappCreds.apiKey);

    // 1. Fetch from Meta
    const metaTemplates = await fetchMetaTemplates({
      apiKey: decryptedApiKey,
      businessAccountId: whatsappCreds.businessAccountId
    });

    console.log(`[TemplateSync] Fetched ${metaTemplates.length} templates from Meta for business ${business._id}`);

    // 2. Sync to local database
    let syncedCount = 0;
    for (const metaT of metaTemplates) {
      // Find the body component
      const bodyComponent = metaT.components.find(c => c.type === 'BODY');
      const bodyText = bodyComponent ? bodyComponent.text : '';

      await AutomationRule.findOneAndUpdate(
        {
          businessId: business._id,
          type: 'manual_template',
          'config.metaTemplateId': metaT.id
        },
        {
          $set: {
            name: metaT.name,
            enabled: true,
            config: {
              channel: 'whatsapp',
              messageTemplate: bodyText,
              isMetaTemplate: true,
              metaTemplateId: metaT.id,
              metaCategory: metaT.category,
              metaStatus: metaT.status,
              language: metaT.language,
              metaComponents: metaT.components
            }
          }
        },
        { upsert: true }
      );
      syncedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${syncedCount} templates from Meta!` 
    });

  } catch (error) {
    console.error('[TemplateSync] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to sync templates' 
    }, { status: 500 });
  }
}
