/**
 * Customer WhatsApp / email on deal stage changes — uses CRM settings templates & toggles.
 */
import Lead from '@/models/automation/Lead';
import User from '@/models/User';
import { getCrmSettings } from '@/lib/crm/crmSettings';
import { normalizeStageKey } from '@/lib/crm/stageKeys';
import { buildTemplateContext, renderCrmTemplate, DEFAULT_CRM_TEMPLATES } from '@/lib/crm/templateVars';
import { sendAutoWhatsApp } from '@/lib/integrations/whatsapp';
import { sendCustomerEmail } from '@/lib/integrations/email';
import { logTimelineEvent } from '@/lib/crm/timeline';

function resolveEmailSubject(settings, templateKey, fallback) {
  const custom = settings.emailSubjects?.[templateKey];
  if (custom?.trim()) {
    return renderCrmTemplate(custom, { company: 'LeadForGrow' });
  }
  return fallback;
}

async function resolveLeadForDeal(deal, businessId) {
  if (!deal.leadId) return null;
  return Lead.findOne({ _id: deal.leadId, businessId }).lean();
}

/**
 * @param {{ business, deal, newStage, userId, body? }} params
 */
export async function runDealStageCustomerMessages({ business, deal, newStage, userId, body = {} }) {
  const stage = normalizeStageKey(newStage);
  const settings = getCrmSettings(business);
  const lead = await resolveLeadForDeal(deal, business._id);
  if (!lead) return { skipped: true, reason: 'no_lead' };

  const assignee = deal.assignedTo ? await User.findById(deal.assignedTo).lean() : null;
  const salesperson = assignee
    ? [assignee.firstName, assignee.lastName].filter(Boolean).join(' ').trim() || 'our team'
    : 'our team';

  const ctx = buildTemplateContext(lead, business, {
    salesperson,
    quotationMessage: body.quotationMessage || body.message || '',
    quotationUrl: body.quotationUrl || '',
    meeting: body.meetingDate
      ? {
          date: body.meetingDate,
          time: body.meetingTime,
          link: body.meetingLink,
          duration: body.meetingDuration,
          platform: body.meetingPlatform,
        }
      : undefined,
  });

  const sent = [];

  if (stage === 'demo_scheduled') {
    if (settings.sendMeetingWhatsApp && lead.phone) {
      const tpl = settings.templates.meetingWhatsApp || DEFAULT_CRM_TEMPLATES.meeting_whatsapp;
      const result = await sendAutoWhatsApp(lead, business, renderCrmTemplate(tpl, ctx)).catch((e) => ({ success: false, error: e.message }));
      sent.push({ channel: 'whatsapp', success: !!result?.success });
      await logTimelineEvent({
        businessId: business._id,
        entityType: 'deal',
        entityId: deal._id,
        leadId: lead._id,
        type: result?.success ? 'whatsapp_sent' : 'whatsapp_failed',
        description: result?.success ? 'Meeting WhatsApp sent (deal stage).' : `Meeting WhatsApp failed: ${result?.error || 'unknown'}`,
        performedBy: userId,
        dedupeKey: `deal_meeting_wa_${deal._id}`,
        metadata: { automation: 'deal_meeting_whatsapp', status: result?.success ? 'success' : 'failed' },
      });
    }
    if (settings.sendMeetingEmail && lead.email) {
      const tpl = settings.templates.meetingEmail || DEFAULT_CRM_TEMPLATES.meeting_email;
      const subject = resolveEmailSubject(settings, 'meetingEmail', 'Meeting invitation');
      const result = await sendCustomerEmail(lead, business, renderCrmTemplate(tpl, ctx), renderCrmTemplate(subject, ctx)).catch((e) => ({ success: false, error: e.message }));
      sent.push({ channel: 'email', success: !!result?.success });
      await logTimelineEvent({
        businessId: business._id,
        entityType: 'deal',
        entityId: deal._id,
        leadId: lead._id,
        type: result?.success ? 'email_sent' : 'email_failed',
        description: result?.success ? 'Meeting email sent (deal stage).' : `Meeting email failed: ${result?.error || 'unknown'}`,
        performedBy: userId,
        dedupeKey: `deal_meeting_email_${deal._id}`,
        metadata: { automation: 'deal_meeting_email', status: result?.success ? 'success' : 'failed' },
      });
    }
  }

  if (stage === 'proposal_sent') {
    if (settings.sendQuotationWhatsApp && lead.phone) {
      const tpl = settings.templates.quotationWhatsApp || DEFAULT_CRM_TEMPLATES.quotation_whatsapp;
      const result = await sendAutoWhatsApp(lead, business, renderCrmTemplate(tpl, ctx)).catch((e) => ({ success: false, error: e.message }));
      sent.push({ channel: 'whatsapp', success: !!result?.success });
      await logTimelineEvent({
        businessId: business._id,
        entityType: 'deal',
        entityId: deal._id,
        leadId: lead._id,
        type: result?.success ? 'whatsapp_sent' : 'whatsapp_failed',
        description: result?.success ? 'Quotation WhatsApp sent.' : `Quotation WhatsApp failed: ${result?.error || 'unknown'}`,
        performedBy: userId,
        dedupeKey: `deal_quotation_wa_${deal._id}`,
        metadata: { automation: 'deal_quotation_whatsapp', status: result?.success ? 'success' : 'failed' },
      });
    }
    if (settings.sendQuotationEmail && lead.email) {
      const tpl = settings.templates.quotationEmail || DEFAULT_CRM_TEMPLATES.quotation_email;
      const subject = resolveEmailSubject(settings, 'quotationEmail', 'Your quotation');
      const result = await sendCustomerEmail(lead, business, renderCrmTemplate(tpl, ctx), renderCrmTemplate(subject, ctx)).catch((e) => ({ success: false, error: e.message }));
      sent.push({ channel: 'email', success: !!result?.success });
      await logTimelineEvent({
        businessId: business._id,
        entityType: 'deal',
        entityId: deal._id,
        leadId: lead._id,
        type: result?.success ? 'email_sent' : 'email_failed',
        description: result?.success ? 'Quotation email sent.' : `Quotation email failed: ${result?.error || 'unknown'}`,
        performedBy: userId,
        dedupeKey: `deal_quotation_email_${deal._id}`,
        metadata: { automation: 'deal_quotation_email', status: result?.success ? 'success' : 'failed' },
      });
    }
  }

  if (stage === 'payment_pending') {
    if (settings.sendPaymentReminderWhatsApp && lead.phone) {
      const tpl = settings.templates.paymentReminderWhatsApp || DEFAULT_CRM_TEMPLATES.payment_reminder_whatsapp;
      const result = await sendAutoWhatsApp(lead, business, renderCrmTemplate(tpl, ctx)).catch((e) => ({ success: false, error: e.message }));
      sent.push({ channel: 'whatsapp', success: !!result?.success });
      await logTimelineEvent({
        businessId: business._id,
        entityType: 'deal',
        entityId: deal._id,
        leadId: lead._id,
        type: result?.success ? 'whatsapp_sent' : 'whatsapp_failed',
        description: result?.success ? 'Payment reminder WhatsApp sent.' : `Payment reminder WhatsApp failed: ${result?.error || 'unknown'}`,
        performedBy: userId,
        dedupeKey: `deal_payment_wa_${deal._id}`,
        metadata: { automation: 'deal_payment_whatsapp', status: result?.success ? 'success' : 'failed' },
      });
    }
    if (settings.sendPaymentReminderEmail && lead.email) {
      const tpl = settings.templates.paymentReminderEmail || DEFAULT_CRM_TEMPLATES.payment_reminder_email;
      const subject = resolveEmailSubject(settings, 'paymentReminderEmail', 'Payment reminder');
      const result = await sendCustomerEmail(lead, business, renderCrmTemplate(tpl, ctx), renderCrmTemplate(subject, ctx)).catch((e) => ({ success: false, error: e.message }));
      sent.push({ channel: 'email', success: !!result?.success });
      await logTimelineEvent({
        businessId: business._id,
        entityType: 'deal',
        entityId: deal._id,
        leadId: lead._id,
        type: result?.success ? 'email_sent' : 'email_failed',
        description: result?.success ? 'Payment reminder email sent.' : `Payment reminder email failed: ${result?.error || 'unknown'}`,
        performedBy: userId,
        dedupeKey: `deal_payment_email_${deal._id}`,
        metadata: { automation: 'deal_payment_email', status: result?.success ? 'success' : 'failed' },
      });
    }
  }

  return { sent };
}

export default { runDealStageCustomerMessages };
