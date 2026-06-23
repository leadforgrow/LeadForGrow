import mongoose from 'mongoose';
import Lead from '@/models/automation/Lead';
import Contact from '@/models/automation/Contact';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import Deal from '@/models/automation/Deal';
import CrmNote from '@/models/automation/CrmNote';
import CrmAttachment from '@/models/automation/CrmAttachment';
import { dbConnect } from '@/lib/mongodb';
import { logTimelineEvent } from './timeline.js';

/**
 * Merge source lead into target lead. Source is archived after merge.
 */
export async function mergeLeads(businessId, sourceId, targetId, performedBy) {
  await dbConnect();

  if (sourceId === targetId) throw new Error('Cannot merge a lead with itself');

  const [source, target] = await Promise.all([
    Lead.findOne({ _id: sourceId, businessId }),
    Lead.findOne({ _id: targetId, businessId }),
  ]);

  if (!source || !target) throw new Error('Lead not found');

  // Merge notes
  if (source.notes?.length) {
    target.notes.push(...source.notes);
  }

  // Merge tags
  const tags = new Set([...(target.tags || []), ...(source.tags || [])]);
  target.tags = [...tags];

  // Fill missing fields from source
  if (!target.email && source.email) target.email = source.email;
  if (!target.phone && source.phone) target.phone = source.phone;
  if (!target.whatsapp && source.whatsapp) target.whatsapp = source.whatsapp;
  if (!target.companyId && source.companyId) target.companyId = source.companyId;
  if (!target.contactId && source.contactId) target.contactId = source.contactId;

  await target.save();

  // Reassign related records
  await Promise.all([
    Activity.updateMany({ leadId: sourceId }, { leadId: targetId, entityId: targetId }),
    Task.updateMany({ leadId: sourceId }, { leadId: targetId }),
    Deal.updateMany({ leadId: sourceId }, { leadId: targetId }),
    CrmNote.updateMany(
      { businessId, entityType: 'lead', entityId: sourceId },
      { entityId: targetId }
    ),
    CrmAttachment.updateMany(
      { businessId, entityType: 'lead', entityId: sourceId },
      { entityId: targetId }
    ),
  ]);

  source.archived = true;
  source.archivedAt = new Date();
  await source.save();

  await logTimelineEvent({
    businessId,
    entityType: 'lead',
    entityId: targetId,
    leadId: targetId,
    type: 'merge_completed',
    description: `Merged lead "${source.name}" into this record`,
    performedBy,
    metadata: { sourceId, targetId },
  });

  return target;
}

/**
 * Merge source contact into target contact.
 */
export async function mergeContacts(businessId, sourceId, targetId, performedBy) {
  await dbConnect();

  if (sourceId === targetId) throw new Error('Cannot merge a contact with itself');

  const [source, target] = await Promise.all([
    Contact.findOne({ _id: sourceId, businessId }),
    Contact.findOne({ _id: targetId, businessId }),
  ]);

  if (!source || !target) throw new Error('Contact not found');

  // Merge phones/emails (dedupe by value)
  const phoneSet = new Set((target.phones || []).map((p) => p.number));
  for (const p of source.phones || []) {
    if (!phoneSet.has(p.number)) target.phones.push(p);
  }
  const emailSet = new Set((target.emails || []).map((e) => e.address));
  for (const e of source.emails || []) {
    if (!emailSet.has(e.address)) target.emails.push(e);
  }

  const tags = new Set([...(target.tags || []), ...(source.tags || [])]);
  target.tags = [...tags];

  if (!target.companyId && source.companyId) target.companyId = source.companyId;
  if (!target.jobTitle && source.jobTitle) target.jobTitle = source.jobTitle;

  await target.save();

  await Lead.updateMany({ contactId: sourceId }, { contactId: targetId });
  await Deal.updateMany({ contactId: sourceId }, { contactId: targetId });
  await Task.updateMany({ contactId: sourceId }, { contactId: targetId });

  source.archived = true;
  await source.save();

  await logTimelineEvent({
    businessId,
    entityType: 'contact',
    entityId: targetId,
    type: 'contact_merged',
    description: `Merged contact "${source.fullName}" into this record`,
    performedBy,
    metadata: { sourceId, targetId },
  });

  return target;
}

export default { mergeLeads, mergeContacts };
