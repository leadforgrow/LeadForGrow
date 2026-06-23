import Lead from '@/models/automation/Lead';
import Broadcast from '@/models/automation/Broadcast';
import Business from '@/models/Business';
import { sendCustomerEmail } from '@/lib/integrations/email';
import { sendAutoWhatsApp } from '@/lib/integrations/whatsapp';

function applyVars(text, lead, business) {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/gi, lead.name || '')
    .replace(/\{\{email\}\}/gi, lead.email || '')
    .replace(/\{\{phone\}\}/gi, lead.phone || '')
    .replace(/\{\{business\.name\}\}/gi, business?.businessName || '');
}

export async function buildAudience(businessId, audience) {
  const query = { businessId, archived: { $ne: true } };

  if (audience.type === 'manual' && audience.leadIds?.length) {
    query._id = { $in: audience.leadIds };
  }
  if (audience.type === 'tags' && audience.tags?.length) {
    query.tags = { $in: audience.tags };
  }
  if (audience.type === 'filter' && audience.filters) {
    const f = audience.filters;
    if (f.status) query.status = f.status;
    if (f.source) query.source = f.source;
    if (f.tags?.length) query.tags = { $in: f.tags };
    if (f.assignedTo) query.assignedTo = f.assignedTo;
  }

  return Lead.find(query).limit(audience.limit || 5000).lean();
}

export async function sendBroadcast(broadcastId) {
  const broadcast = await Broadcast.findById(broadcastId);
  if (!broadcast || broadcast.status === 'sent') return broadcast;

  const business = await Business.findById(broadcast.businessId);
  if (!business) throw new Error('Business not found');

  await Broadcast.updateOne({ _id: broadcastId }, { $set: { status: 'sending', sentAt: new Date() } });

  const leads = broadcast.testMode
    ? (broadcast.testRecipients || []).map((r) => ({ name: r.name, email: r.email, phone: r.phone }))
    : await buildAudience(broadcast.businessId, broadcast.audience);

  const recipients = [];
  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const recipient = { leadId: lead._id, email: lead.email, phone: lead.phone, name: lead.name, status: 'pending' };
    try {
      if (broadcast.channel === 'email' || broadcast.channel === 'both') {
        if (lead.email) {
          const body = applyVars(broadcast.content?.body || '', lead, business);
          const subject = applyVars(broadcast.content?.subject || broadcast.name, lead, business);
          const result = await sendCustomerEmail(lead, business, body, subject);
          recipient.status = result.success ? 'sent' : 'failed';
          recipient.error = result.error;
          if (result.success) sent++;
          else failed++;
        } else {
          recipient.status = 'skipped';
          recipient.error = 'No email';
        }
      }
      if (broadcast.channel === 'whatsapp' || broadcast.channel === 'both') {
        if (lead.phone) {
          const msg = applyVars(broadcast.content?.whatsappTemplate || broadcast.content?.body || '', lead, business);
          const result = await sendAutoWhatsApp(lead, business, msg, broadcast.content?.whatsappTemplateName);
          if (recipient.status !== 'sent') {
            recipient.status = result.success ? 'sent' : 'failed';
            recipient.error = result.error;
          }
          if (result.success) sent++;
          else failed++;
        }
      }
      recipient.sentAt = new Date();
    } catch (err) {
      recipient.status = 'failed';
      recipient.error = err.message;
      failed++;
    }
    recipients.push(recipient);
  }

  await Broadcast.updateOne(
    { _id: broadcastId },
    {
      $set: {
        status: failed === leads.length ? 'failed' : 'sent',
        completedAt: new Date(),
        recipients,
        'analytics.total': leads.length,
        'analytics.sent': sent,
        'analytics.failed': failed,
      },
    }
  );

  return Broadcast.findById(broadcastId);
}

export async function retryFailedRecipients(broadcastId) {
  const broadcast = await Broadcast.findById(broadcastId);
  if (!broadcast) return null;

  const failedRecipients = (broadcast.recipients || []).filter((r) => r.status === 'failed');
  if (!failedRecipients.length) return broadcast;

  const business = await Business.findById(broadcast.businessId);
  for (const recipient of failedRecipients) {
    const lead = recipient.leadId
      ? await Lead.findById(recipient.leadId)
      : { name: recipient.name, email: recipient.email, phone: recipient.phone };
    if (!lead) continue;
    try {
      if (broadcast.channel === 'email' && lead.email) {
        await sendCustomerEmail(lead, business, broadcast.content?.body, broadcast.content?.subject);
        recipient.status = 'sent';
      }
      if (broadcast.channel === 'whatsapp' && lead.phone) {
        await sendAutoWhatsApp(lead, business, broadcast.content?.whatsappTemplate || broadcast.content?.body);
        recipient.status = 'sent';
      }
    } catch {
      /* keep failed */
    }
  }

  await Broadcast.updateOne({ _id: broadcastId }, { $set: { recipients: broadcast.recipients } });
  return Broadcast.findById(broadcastId);
}

export default { buildAudience, sendBroadcast, retryFailedRecipients };
