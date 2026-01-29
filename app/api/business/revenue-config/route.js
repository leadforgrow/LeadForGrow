import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import { withPlanAccess } from '@/lib/accessControl';

// GET - Fetch revenue intelligence configuration
export async function GET(request) {
  return withPlanAccess(request, 'revenue-config', async (req, user) => {
    try {
      await dbConnect();
      const business = await Business.findById(user.businessId);
      
      if (!business) {
        return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
      }

      // Return existing revenue config or defaults
      const revenueConfig = business.revenueConfig || getDefaultConfig();

      return NextResponse.json({ 
        success: true, 
        data: revenueConfig
      });
    } catch (error) {
      console.error('Error fetching revenue config:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch configuration' }, { status: 500 });
    }
  });
}

// PUT - Update revenue intelligence configuration
export async function PUT(request) {
  return withPlanAccess(request, 'revenue-config', async (req, user) => {
    try {
      await dbConnect();
      const business = await Business.findById(user.businessId);
      
      if (!business) {
        return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
      }

      const body = await request.json();
      
      // Validate required fields
      if (!body.avgDealValue?.typical) {
        return NextResponse.json({ 
          success: false, 
          error: 'Typical deal value is required' 
        }, { status: 400 });
      }

      if (!body.estimationAcknowledged) {
        return NextResponse.json({ 
          success: false, 
          error: 'You must acknowledge the estimation disclaimer' 
        }, { status: 400 });
      }

      // Save configuration
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
        configuredAt: new Date(),
        lastUpdatedAt: new Date()
      };

      // Mark revenue intelligence as active
      business.revenueIntelligenceActive = true;

      await business.save();
      
      console.log('[RevenueConfig] Configuration saved successfully for business:', business._id);

      return NextResponse.json({ 
        success: true, 
        data: business.revenueConfig,
        message: 'Revenue intelligence configured successfully!'
      });
    } catch (error) {
      console.error('Error updating revenue config:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save configuration' 
      }, { status: 500 });
    }
  });
}

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