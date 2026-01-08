import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';

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
      }
      
      // Update Integrations if provided (Crucial for SMTP/WhatsApp)
      if (integrationCredentials) {
        business.integrationCredentials = { ...business.integrationCredentials, ...integrationCredentials };
      }

      if (body.generateWebhookSecret) {
        business.generateWebhookSecret();
      }

      if (onboardingStep) business.onboardingStep = onboardingStep;
      if (onboardingComplete !== undefined) business.onboardingComplete = onboardingComplete;
      
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
