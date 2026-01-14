import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';
import { encrypt, isEncrypted } from '@/lib/encryption';

// GET - Fetch business settings and integrations
export async function GET(request) {
  return withPlanAccess(request, 'settings', async (req, user) => {
    try {
      await dbConnect();
      const business = await Business.findById(user.businessId);
      
      if (!business) {
        return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        data: {
          settings: business.settings,
          integrationCredentials: business.integrationCredentials,
          integrationHealth: business.integrationHealth,
          webhookSecret: business.webhookSecret,
          businessName: business.businessName,
          plan: business.plan
        } 
      });
    } catch (error) {
      console.error('Error fetching business data:', error);
      return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
  });
}

// PUT - Update business settings or integrations
export async function PUT(request) {
  return withPlanAccess(request, 'settings', async (req, user) => {
    try {
      await dbConnect();
      const business = await Business.findById(user.businessId);
      
      if (!business) {
        return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
      }

      const body = await request.json();
      const { settings, integrationCredentials, onboardingStep, onboardingComplete } = body;
      
      // Update Settings if provided
      if (settings) {
        business.settings = { ...business.settings, ...settings };
      } else if (body.assignmentStrategy) {
        // Fallback for direct strategy update
        business.settings.assignmentStrategy = body.assignmentStrategy;
      }
      
      // Update Integrations if provided (Crucial for SMTP/WhatsApp)
      if (integrationCredentials) {
        // Encrypt email password if provided and not already encrypted
        if (integrationCredentials.email?.password) {
          const password = integrationCredentials.email.password;
          if (!isEncrypted(password)) {
            console.log('[BusinessSettings] Encrypting email password...');
            integrationCredentials.email.password = encrypt(password);
          }
        }
        
        business.integrationCredentials = { ...business.integrationCredentials, ...integrationCredentials };
      }

      if (body.generateWebhookSecret) {
        business.generateWebhookSecret();
      }

      if (body.onboardingStep) business.onboardingStep = onboardingStep;
      if (body.onboardingComplete !== undefined) business.onboardingComplete = onboardingComplete;
      
      // Update Root Level Fields (Business Info)
      if (body.businessName) business.businessName = body.businessName;
      if (body.industry) business.industry = body.industry;
      if (body.website) business.website = body.website;
      if (body.logo) business.logo = body.logo;

      await business.save();
      
      return NextResponse.json({ 
        success: true, 
        data: {
          settings: business.settings,
          integrationCredentials: business.integrationCredentials
        } 
      });
    } catch (error) {
      console.error('Error updating business data:', error);
      return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
  });
}
