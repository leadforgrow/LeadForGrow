import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import AutomationRule from '@/models/automation/AutomationRule';
import User from '@/models/User';
import Business from '@/models/Business';

// Helper to get business
async function getBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return null;
  
  await dbConnect();
  const user = await User.findById(userId);
  if (!user || !user.businessId) return null;
  
  return user.businessId;
}

export async function GET(request) {
  try {
    const businessId = await getBusiness(request);
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch welcome rule
    const welcomeRule = await AutomationRule.findOne({
      businessId,
      type: 'instant_acknowledgement',
      'triggers.onLeadReceived': true
    });

    // Fetch follow up rule
    const followUpRule = await AutomationRule.findOne({
      businessId,
      type: 'follow_up_reminder'
    });

    return NextResponse.json({
      success: true,
      welcome: welcomeRule ? {
        subject: welcomeRule.config.emailSubject || '',
        body: welcomeRule.config.messageTemplate || '',
        enabled: welcomeRule.enabled
      } : null,
      followUp: followUpRule ? {
        subject: followUpRule.config.emailSubject || '',
        body: followUpRule.config.messageTemplate || '',
        enabled: followUpRule.enabled,
        delayHours: followUpRule.config.delayHours || 24
      } : null
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { welcome, followUp, userId } = body;

    await dbConnect();
    const user = await User.findById(userId);
    if (!user || !user.businessId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const businessId = user.businessId;

    // 1. Update/Create 'Lead Welcome Email' (Instant Acknowledgement)
    if (welcome) {
      await AutomationRule.findOneAndUpdate(
        { 
          businessId, 
          type: 'instant_acknowledgement' 
        },
        {
          $set: {
            name: 'Lead Welcome Email',
            description: 'Automatically sent to new leads',
            enabled: welcome.enabled,
            'config.messageTemplate': welcome.body,
            'config.emailSubject': welcome.subject,
            'config.channel': 'email', // Force email channel
            'triggers.onLeadReceived': true
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }

    // 2. Update/Create 'Follow-Up Email'
    if (followUp) {
      await AutomationRule.findOneAndUpdate(
        { 
          businessId, 
          type: 'follow_up_reminder' 
        },
        {
          $set: {
            name: 'Automated Follow-Up',
            description: 'Follow-up email after delay or condition',
            enabled: followUp.enabled,
            'config.messageTemplate': followUp.body,
            'config.emailSubject': followUp.subject,
            'config.delayHours': followUp.delayHours,
            'triggers.onStatusChange': true, // Assuming generic status change trigger for now
             // Note: Triggers might need refinement based on exact needed logic
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving templates:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
