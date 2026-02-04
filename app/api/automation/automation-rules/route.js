import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import AutomationRule from '@/models/automation/AutomationRule';
import { withPlanAccess } from '@/lib/accessControl';

// GET - Fetch all rules for a business
export async function GET(request) {
  return withPlanAccess(request, 'automation', async (req, user) => {
    try {
      await dbConnect();
      const businessId = user.businessId;
      
      // Check if business has any rules, if not create default ones
      let rules = await AutomationRule.find({ businessId });
      
      if (rules.length === 0) {
        const defaultRules = [
          {
            businessId,
            name: 'Instant Lead Acknowledgement',
            description: 'Send a professional Email & WhatsApp greeting immediately to build trust.',
            type: 'instant_acknowledgement',
            enabled: true,
            config: { 
              channel: 'both',
              messageTemplate: 'Hi {{name}}, thank you for choosing us! 🚀 We have received your interest in {{serviceInterest}}. Our top strategist is reviewing your details and will call you shortly to discuss how we can help you grow. Stay tuned!',
              emailSubject: 'Thank you for your interest, {{name}}! We are reviewing your inquiry.'
            },
            triggers: { onLeadReceived: true }
          },
          {
            businessId,
            name: 'Notify Team on New Lead',
            description: 'Zapier-style instant notification to the assigned team member.',
            type: 'notify_team',
            enabled: true,
            config: { delayHours: 0 },
            triggers: { onLeadReceived: true }
          },
          {
            businessId,
            name: 'Auto-Assign Leads',
            description: 'High-performance round-robin lead distribution for maximum efficiency.',
            type: 'auto_assign',
            enabled: false,
            config: { assignmentRule: 'round-robin' },
            triggers: { onLeadReceived: true }
          },
          {
            businessId,
            name: 'Follow-up Reminder',
            description: 'Smart fallback: Automatically create a task if a lead stays stale for 24h.',
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
  });
}

// POST - Create new automation rule
export async function POST(request) {
  return withPlanAccess(request, 'automation', async (req, user) => {
    try {
      await dbConnect();
      const businessId = user.businessId;
      const body = await request.json();
      
      // Create rule
      const rule = await AutomationRule.create({
        businessId,
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
  });
}

// PUT - Update automation rule
export async function PUT(request) {
  return withPlanAccess(request, 'automation', async (req, user) => {
    try {
      await dbConnect();
      const businessId = user.businessId;
      const body = await request.json();
      const { ruleId, ...updates } = body;
      
      if (!ruleId) {
        return NextResponse.json({ success: false, error: 'Rule ID required' }, { status: 400 });
      }
      
      // Find rule and verify ownership
      const rule = await AutomationRule.findOne({ _id: ruleId, businessId });
      if (!rule) {
        return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
      }
      
      // Update allowed fields
      const allowedUpdates = ['name', 'description', 'enabled', 'config', 'triggers'];
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          console.log(`[API Rules] Updating ${key}:`, updates[key]);
          rule.set(key, updates[key]);
        }
      });
      
      await rule.save();
      console.log(`[API Rules] Rule ${ruleId} saved successfully. Config:`, rule.config);
      
      return NextResponse.json({ success: true, data: rule });
    } catch (error) {
      console.error('Error updating rule:', error);
      return NextResponse.json({ success: false, error: 'Failed to update automation rule' }, { status: 500 });
    }
  });
}
