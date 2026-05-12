import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import { withPlanAccess } from '@/lib/accessControl';

// GET - Fetch business settings and intelligence configuration
export const GET = withPlanAccess('revenue-config', async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const business = await Business.findById(user.businessId);

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    // Return existing revenue config or defaults + integration info
    return NextResponse.json({
      success: true,
      data: {
        revenueConfig: business.revenueConfig || getDefaultConfig(),
        integrationCredentials: business.integrationCredentials,
        settings: business.settings
      }
    });
  } catch (error) {
    console.error('Error fetching business settings:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
});

// PUT - Update business settings, integrations or intelligence config
export const PUT = withPlanAccess('revenue-config', async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const business = await Business.findById(user.businessId);

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    const body = await req.json();

    // 1. Handle Integration Credentials Update
    if (body.integrationCredentials) {
      const { encrypt, isEncrypted } = await import('@/lib/encryption');
      const incoming = body.integrationCredentials;

      // Secure WhatsApp credentials
      if (incoming.whatsapp) {
        const w = incoming.whatsapp;
        if (w.apiKey && !isEncrypted(w.apiKey)) w.apiKey = encrypt(w.apiKey);
        if (w.interaktApiKey && !isEncrypted(w.interaktApiKey)) w.interaktApiKey = encrypt(w.interaktApiKey);
        if (w.appSecret && !isEncrypted(w.appSecret)) w.appSecret = encrypt(w.appSecret);
        if (w.verifyToken && !isEncrypted(w.verifyToken)) w.verifyToken = encrypt(w.verifyToken);
      }

      // Secure Meta Ads credentials
      if (incoming.facebookAds) {
        const f = incoming.facebookAds;
        if (f.accessToken && !isEncrypted(f.accessToken)) f.accessToken = encrypt(f.accessToken);
        if (f.verifyToken && !isEncrypted(f.verifyToken)) f.verifyToken = encrypt(f.verifyToken);
      }

      // Secure Email credentials
      if (incoming.email && incoming.email.password && !isEncrypted(incoming.email.password)) {
        incoming.email.password = encrypt(incoming.email.password);
      }

      const existing = business.integrationCredentials ? business.integrationCredentials.toObject() : {};

      // Deep merge
      business.integrationCredentials = {
        ...existing,
        ...incoming,
        whatsapp: {
          ...(existing.whatsapp || {}),
          ...(incoming.whatsapp || {})
        },
        facebookAds: {
          ...(existing.facebookAds || {}),
          ...(incoming.facebookAds || {})
        },
        email: {
          ...(existing.email || {}),
          ...(incoming.email || {})
        }
      };

      business.markModified('integrationCredentials');
    }

    // 2. Handle Settings Update
    if (body.settings) {
      business.settings = {
        ...business.settings,
        ...body.settings
      };
    }

    // 3. Handle Revenue Intelligence Configuration (only if provided)
    if (body.avgDealValue) {
      // Validate required fields for revenue config
      if (!body.avgDealValue?.typical) {
        return NextResponse.json({ success: false, error: 'Typical deal value is required' }, { status: 400 });
      }
      if (!body.estimationAcknowledged) {
        return NextResponse.json({ success: false, error: 'Acknowledge the estimation disclaimer' }, { status: 400 });
      }

      business.revenueConfig = {
        avgDealValue: body.avgDealValue,
        serviceValues: body.serviceValues || [],
        sla: body.sla,
        workingHours: body.workingHours,
        conversionRate: body.conversionRate,
        sources: body.sources || [],
        followup: body.followup,
        preferredChannels: body.preferredChannels || [],
        teamRoles: body.teamRoles || [],
        estimationAcknowledged: body.estimationAcknowledged,
        configuredAt: business.revenueConfig?.configuredAt || new Date(),
        lastUpdatedAt: new Date()
      };
      business.revenueIntelligenceActive = true;
    }

    await business.save();

    return NextResponse.json({
      success: true,
      data: business,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating business settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
});

// Helper function for default configuration
function getDefaultConfig() {
  return {
    avgDealValue: {
      min: '',
      typical: '',
      high: '',
      currency: 'INR'
    },
    serviceValues: [],
    sla: {
      firstResponseMinutes: 15,
      followupMinutes: 60
    },
    workingHours: {
      days: [1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Asia/Kolkata'
    },
    conversionRate: {
      low: 5,
      avg: 10,
      high: 20
    },
    sources: [
      { name: 'WhatsApp', weight: 0.8, avgConversion: 15 },
      { name: 'Google Ads', weight: 0.6, avgConversion: 10 },
      { name: 'Manual Entry', weight: 0.4, avgConversion: 5 }
    ],
    followup: {
      maxAttempts: 5,
      gapMinutes: 1440
    },
    preferredChannels: ['call', 'whatsapp'],
    teamRoles: [],
    estimationAcknowledged: false
  };
}