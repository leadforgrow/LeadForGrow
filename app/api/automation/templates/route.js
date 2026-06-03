import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import AutomationRule from '@/models/automation/AutomationRule';
import { withTenantAuth, resolveTenant } from '@/lib/auth';

export const GET = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    await dbConnect();
    const businessId = tenant.business._id;

    const [welcomeRule, followUpRule, manualTemplates] = await Promise.all([
      AutomationRule.findOne({ businessId, type: 'instant_acknowledgement', 'triggers.onLeadReceived': true }),
      AutomationRule.findOne({ businessId, type: 'follow_up_reminder' }),
      AutomationRule.find({ businessId, type: 'manual_template' }).sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      success: true,
      welcome: welcomeRule
        ? {
            subject: welcomeRule.config.emailSubject || '',
            body: welcomeRule.config.messageTemplate || '',
            enabled: welcomeRule.enabled,
          }
        : null,
      followUp: followUpRule
        ? {
            subject: followUpRule.config.emailSubject || '',
            body: followUpRule.config.messageTemplate || '',
            enabled: followUpRule.enabled,
            delayHours: followUpRule.config.delayHours || 24,
          }
        : null,
      manual: manualTemplates.map((t) => ({
        id: t._id,
        name: t.name,
        subject: t.config.emailSubject || '',
        body: t.config.messageTemplate || '',
        channel: t.config.channel || 'whatsapp',
        enabled: t.enabled,
        isMetaTemplate: t.config.isMetaTemplate || false,
        metaCategory: t.config.metaCategory || '',
        metaStatus: t.config.metaStatus || '',
      })),
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (request) => {
  try {
    const tenant = await resolveTenant(request);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const body = await request.json();
    const { welcome, followUp } = body;
    const businessId = tenant.business._id;

    await dbConnect();

    if (welcome) {
      await AutomationRule.findOneAndUpdate(
        { businessId, type: 'instant_acknowledgement' },
        {
          $set: {
            name: 'Lead Welcome Email',
            description: 'Automatically sent to new leads',
            enabled: welcome.enabled,
            'config.messageTemplate': welcome.body,
            'config.emailSubject': welcome.subject,
            'config.channel': 'email',
            'triggers.onLeadReceived': true,
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    if (followUp) {
      await AutomationRule.findOneAndUpdate(
        { businessId, type: 'follow_up_reminder' },
        {
          $set: {
            name: 'Automated Follow-Up',
            description: 'Follow-up email after delay or condition',
            enabled: followUp.enabled,
            'config.messageTemplate': followUp.body,
            'config.emailSubject': followUp.subject,
            'config.delayHours': followUp.delayHours,
            'triggers.onStatusChange': true,
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true }
      );
    }

    if (body.manual) {
      for (const t of body.manual) {
        if (t.id) {
          await AutomationRule.findOneAndUpdate(
            { _id: t.id, businessId, type: 'manual_template' },
            {
              $set: {
                name: t.name,
                description: 'Manual sending template',
                'config.messageTemplate': t.body,
                'config.emailSubject': t.subject,
                'config.channel': t.channel || 'whatsapp',
              },
            }
          );
        } else {
          await AutomationRule.create({
            businessId,
            type: 'manual_template',
            name: t.name,
            description: 'Manual sending template',
            enabled: true,
            config: {
              messageTemplate: t.body,
              emailSubject: t.subject,
              channel: t.channel || 'whatsapp',
            },
          });
        }
      }
    }

    if (body.deleteManualIds?.length) {
      await AutomationRule.deleteMany({
        _id: { $in: body.deleteManualIds },
        businessId,
        type: 'manual_template',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving templates:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
});
