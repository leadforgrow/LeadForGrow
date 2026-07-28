import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import AutomationRule from '@/models/automation/AutomationRule';
import WhatsAppFlow from '@/models/automation/WhatsAppFlow';
import { withPlanAccess } from '@/lib/accessControl';

// GET - Fetch all rules + WhatsApp flows for a business
export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const user = req.user;
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
          description: 'High-speed instant notification to the assigned team member.',
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

    // Fetch WhatsApp flows — published = active (ON), archived = paused (OFF).
    // Both are shown so the toggle can turn a flow back on. Drafts (still being
    // built in the flow editor) are intentionally excluded here.
    const whatsappFlows = await WhatsAppFlow.find({ businessId, status: { $in: ['published', 'archived'] } })
      .select('name description status triggerType analytics publishedAt updatedAt')
      .lean();

    // Transform WhatsApp flows to match automation rules format
    const transformedFlows = whatsappFlows.map((flow) => ({
      _id: flow._id,
      id: flow._id.toString(),
      name: flow.name,
      description: flow.description || '',
      type: 'whatsapp_flow',
      category: 'whatsapp',
      enabled: flow.status === 'published',
      icon: '💬',
      channel: 'whatsapp',
      trigger: flow.triggerType || 'incoming_message',
      runs: flow.analytics?.totalExecutions || 0,
      config: {
        flowType: 'whatsapp_flow',
        triggerType: flow.triggerType,
        totalExecutions: flow.analytics?.totalExecutions || 0,
        completed: flow.analytics?.completed || 0,
        failed: flow.analytics?.failed || 0,
      },
      triggers: { onIncomingWhatsApp: true },
      createdAt: flow.publishedAt || new Date(),
      updatedAt: flow.updatedAt || flow.publishedAt || new Date(),
    }));

    // Combine CRM rules + WhatsApp flows
    const allRules = [...rules, ...transformedFlows].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    return NextResponse.json({ success: true, data: allRules });
  } catch (error) {
    console.error('Error fetching/creating rules:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch automation rules' }, { status: 500 });
  }
});

// POST - Create new automation rule
export const POST = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const businessId = user.businessId;
    const body = await req.json();

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

// PUT - Update automation rule
export const PUT = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const user = req.user;
    const businessId = user.businessId;
    const body = await req.json();
    const { ruleId, ...updates } = body;

    if (!ruleId) {
      return NextResponse.json({ success: false, error: 'Rule ID required' }, { status: 400 });
    }

    // Find rule and verify ownership
    const rule = await AutomationRule.findOne({ _id: ruleId, businessId });
    if (!rule) {
      // The list also includes WhatsApp flows — toggle those via their status
      // (published = ON, archived = OFF) instead of the AutomationRule model.
      const flow = await WhatsAppFlow.findOne({ _id: ruleId, businessId });
      if (flow) {
        if (updates.enabled !== undefined) {
          flow.status = updates.enabled ? 'published' : 'archived';
        }
        if (typeof updates.name === 'string') flow.name = updates.name;
        if (typeof updates.description === 'string') flow.description = updates.description;
        await flow.save();
        return NextResponse.json({
          success: true,
          data: {
            _id: flow._id,
            name: flow.name,
            description: flow.description || '',
            type: 'whatsapp_flow',
            enabled: flow.status === 'published',
          },
        });
      }
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

    if (rule.type === 'sequence_runner' && updates.enabled !== undefined && rule.config?.sequenceId) {
      const AutomationSequence = (await import('@/models/automation/AutomationSequence')).default;
      await AutomationSequence.updateOne(
        { _id: rule.config.sequenceId, businessId },
        { $set: { status: updates.enabled ? 'active' : 'paused', active: updates.enabled } }
      );
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ success: false, error: 'Failed to update automation rule' }, { status: 500 });
  }
});
