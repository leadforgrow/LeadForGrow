import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import AutomationRule from '@/models/automation/AutomationRule';
import User from '@/models/User';
import Business from '@/models/Business';

// Helper to get user and business
async function getUserAndBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return { error: 'Authentication required', status: 401 };
  }
  
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  const business = await Business.findById(user.businessId);
  if (!business) {
    return { error: 'Business not found', status: 404 };
  }
  
  return { user, business };
}

// GET - Fetch all rules for a business
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    
    // Check plan access
    if (business.plan === 'free') {
      return NextResponse.json({
        success: false,
        error: 'Automation requires Growth plan or higher',
        requiresUpgrade: true
      }, { status: 403 });
    }
    
    // Check if business has any rules, if not create default ones
    let rules = await AutomationRule.find({ businessId: business._id });
    
    if (rules.length === 0) {
      const defaultRules = [
        {
          businessId: business._id,
          name: 'Instant Lead Acknowledgement',
          description: 'Send WhatsApp message to customer when a new lead is received',
          type: 'instant_acknowledgement',
          enabled: true,
          config: { 
            channel: 'whatsapp',
            messageTemplate: 'Thank you {{name}} for your interest! We will get back to you shortly.'
          },
          triggers: { onLeadReceived: true }
        },
        {
          businessId: business._id,
          name: 'Notify Team on New Lead',
          description: 'Send notification to assigned team member when new lead arrives',
          type: 'notify_team',
          enabled: true,
          config: { delayHours: 0 },
          triggers: { onLeadReceived: true }
        },
        {
          businessId: business._id,
          name: 'Auto-Assign Leads',
          description: 'Automatically assign new leads to team members using round-robin',
          type: 'auto_assign',
          enabled: false,
          config: { assignmentRule: 'round-robin' },
          triggers: { onLeadReceived: true }
        },
        {
          businessId: business._id,
          name: 'Follow-up Reminder',
          description: 'Create follow-up task if lead is not contacted within 24 hours',
          type: 'follow_up_reminder',
          enabled: true,
          config: { delayHours: 24 },
          triggers: { onLeadReceived: true }
        }
      ];
      rules = await AutomationRule.insertMany(defaultRules);
    }
    
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching/creating rules:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch automation rules' }, { status: 500 });
  }
}

// POST - Create new automation rule
export async function POST(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const body = await request.json();
    
    // Check plan access
    if (business.plan === 'free') {
      return NextResponse.json({
        success: false,
        error: 'Automation requires Growth plan or higher',
        requiresUpgrade: true
      }, { status: 403 });
    }
    
    // Check quota
    const existingRules = await AutomationRule.countDocuments({ businessId: business._id });
    if (existingRules >= business.quotas.maxAutomationRules) {
      return NextResponse.json({
        success: false,
        error: `Automation rule limit reached (${business.quotas.maxAutomationRules}). Please upgrade your plan.`,
        requiresUpgrade: true
      }, { status: 403 });
    }
    
    // Create rule
    const rule = await AutomationRule.create({
      businessId: business._id,
      name: body.name,
      description: body.description,
      type: body.type,
      enabled: body.enabled !== undefined ? body.enabled : true,
      config: body.config || {},
      triggers: body.triggers || {}
    });
    
    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json({ success: false, error: 'Failed to create automation rule' }, { status: 500 });
  }
}

// PUT - Update automation rule
export async function PUT(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const body = await request.json();
    const { ruleId, ...updates } = body;
    
    if (!ruleId) {
      return NextResponse.json({ success: false, error: 'Rule ID required' }, { status: 400 });
    }
    
    // Find rule and verify ownership
    const rule = await AutomationRule.findOne({ _id: ruleId, businessId: business._id });
    if (!rule) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }
    
    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'enabled', 'config', 'triggers'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        rule[key] = updates[key];
      }
    });
    
    await rule.save();
    
    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ success: false, error: 'Failed to update automation rule' }, { status: 500 });
  }
}
