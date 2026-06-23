import Lead from '@/models/automation/Lead';
import Contact from '@/models/automation/Contact';
import Company from '@/models/automation/Company';
import Deal from '@/models/automation/Deal';
import { dbConnect } from '@/lib/mongodb';
import { logTimelineEvent } from './timeline.js';
import { ensureDefaultPipeline, getStageByKey } from './pipelines.js';
import { findDuplicateContacts } from './duplicateDetection.js';

function readCustomField(lead, key) {
  if (!lead.customFields) return null;
  if (typeof lead.customFields.get === 'function') return lead.customFields.get(key);
  return lead.customFields[key];
}

async function resolveOrCreateCompany(businessId, lead, userId, options = {}) {
  if (lead.companyId) {
    return Company.findById(lead.companyId);
  }

  const companyName =
    options.companyName ||
    readCustomField(lead, 'company') ||
    readCustomField(lead, 'companyName') ||
    lead.metadata?.get?.('company') ||
    null;

  if (!companyName || typeof companyName !== 'string') return null;

  const trimmed = companyName.trim();
  if (!trimmed) return null;

  let company = await Company.findOne({
    businessId,
    name: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    deletedAt: null,
  });

  if (!company) {
    company = await Company.create({
      businessId,
      name: trimmed,
      ownerId: lead.assignedTo || userId,
      createdBy: userId,
    });

    await logTimelineEvent({
      businessId,
      entityType: 'company',
      entityId: company._id,
      type: 'company_created',
      description: `Company "${company.name}" created from lead conversion`,
      performedBy: userId,
      metadata: { leadId: lead._id },
    });
  }

  return company;
}

/**
 * Convert a lead to contact + company + deal (production flow).
 */
export async function convertLead(businessId, leadId, userId, options = {}) {
  await dbConnect();

  const lead = await Lead.findOne({ _id: leadId, businessId });
  if (!lead) throw new Error('Lead not found');
  if (lead.status === 'converted') throw new Error('Lead already converted');

  const pipeline = options.pipelineId
    ? await (await import('@/models/automation/Pipeline')).default.findOne({
        _id: options.pipelineId,
        businessId,
        archived: false,
      })
    : await ensureDefaultPipeline(businessId);

  if (!pipeline) throw new Error('Pipeline not found');

  const dealStage = options.dealStage || 'qualified';
  const stageConfig = getStageByKey(pipeline, dealStage);

  const company = await resolveOrCreateCompany(businessId, lead, userId, options);
  const companyId = company?._id || lead.companyId || options.companyId;

  let contact = null;
  if (lead.contactId) {
    contact = await Contact.findById(lead.contactId);
  }

  if (!contact) {
    const nameParts = (lead.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ');

    const duplicates = await findDuplicateContacts(businessId, {
      phones: lead.phone ? [lead.phone] : [],
      emails: lead.email ? [lead.email] : [],
    });

    if (duplicates?.length && options.linkExistingContact !== false) {
      contact = await Contact.findById(duplicates[0]._id);
    }

    if (!contact) {
      const contactData = {
        businessId,
        type: 'personal',
        firstName,
        lastName,
        ownerId: options.assignedTo || lead.assignedTo || userId,
        leadId: lead._id,
        companyId,
        source: lead.source,
        createdBy: userId,
      };
      if (lead.phone) contactData.phones = [{ number: lead.phone, primary: true, type: 'mobile' }];
      if (lead.email) contactData.emails = [{ address: lead.email, primary: true, type: 'work' }];
      contact = await Contact.create(contactData);

      await logTimelineEvent({
        businessId,
        entityType: 'contact',
        entityId: contact._id,
        type: 'contact_created',
        description: `Contact created from lead conversion`,
        performedBy: userId,
        metadata: { leadId: lead._id },
      });
    } else if (companyId && !contact.companyId) {
      contact.companyId = companyId;
      await contact.save();
    }
  }

  const createDeal = options.createDeal !== false;
  let deal = null;

  if (createDeal) {
    deal = await Deal.create({
      businessId,
      title: options.dealTitle || `Deal — ${lead.name}`,
      amount: options.dealAmount || 0,
      currency: options.currency || 'INR',
      stage: dealStage,
      probability: stageConfig?.probability ?? 15,
      pipelineId: pipeline._id,
      expectedCloseDate: options.expectedCloseDate ? new Date(options.expectedCloseDate) : undefined,
      leadId: lead._id,
      contactId: contact._id,
      companyId,
      assignedTo: options.assignedTo || lead.assignedTo || userId,
      ownerId: userId,
      createdBy: userId,
    });

    await logTimelineEvent({
      businessId,
      entityType: 'deal',
      entityId: deal._id,
      leadId: lead._id,
      type: 'deal_created',
      description: `Deal "${deal.title}" created from lead conversion`,
      performedBy: userId,
      metadata: { leadId: lead._id, contactId: contact._id, companyId },
    });

    if (companyId) {
      await logTimelineEvent({
        businessId,
        entityType: 'company',
        entityId: companyId,
        type: 'company_updated',
        description: `Deal "${deal.title}" linked from lead conversion`,
        performedBy: userId,
        metadata: { dealId: deal._id, leadId: lead._id },
      });
    }
  }

  lead.status = 'converted';
  lead.convertedAt = new Date();
  lead.contactId = contact._id;
  if (companyId) lead.companyId = companyId;
  lead.updatedBy = userId;
  await lead.save();

  await logTimelineEvent({
    businessId,
    entityType: 'lead',
    entityId: lead._id,
    leadId: lead._id,
    type: 'lead_converted',
    description: `Lead converted to contact${deal ? ' and deal' : ''}`,
    performedBy: userId,
    metadata: { contactId: contact._id, dealId: deal?._id, companyId },
  });

  return { lead, contact, company, deal, pipeline };
}

export default { convertLead };
