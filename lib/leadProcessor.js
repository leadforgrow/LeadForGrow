import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import User from '@/models/User';
import { automationEngine } from './automationEngine';
import { queueAutomation } from './queue';

// Removed file-based logging - use console.log for Vercel compatibility
function logToFile(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${msg}`);
}

/**
 * Lead Processor Service
 * Centralized engine for unified lead ingestion across all sources.
 */

/**
 * Determine lead assignment based on business settings
 */
async function resolveAssignment(businessId, business) {
  const strategy = business.settings?.assignmentStrategy || 'solo';
  const targetBizId = typeof businessId === 'string' ? new mongoose.Types.ObjectId(businessId) : businessId;

  if (strategy === 'solo') {
    return business.ownerId;
  }

  if (strategy === 'round-robin') {
    // Find all potential assignees (active only)
    const teamMembers = await User.find({
      businessId: targetBizId,
      active: { $ne: false } // Include true and undefined defaults
    }).sort({ lastActivityAt: 1, _id: 1 }); // Use stable sort

    if (teamMembers.length === 0) {
      console.warn(`[Assignment] No active team members found for business ${targetBizId}. Falling back to owner.`);
      return business.ownerId;
    }

    const assignedUser = teamMembers[0];

    try {
      await User.findByIdAndUpdate(assignedUser._id, {
        $set: { lastActivityAt: new Date() }
      });
      console.log(`[Assignment] Round-robin: Assigned to ${assignedUser.email}`);
    } catch (updateError) {
      console.error(`[Assignment] Error updating lastActivityAt:`, updateError);
    }

    return assignedUser._id;
  }

  if (strategy === 'least-busy') {
    const teamMembers = await User.find({
      businessId: targetBizId,
      active: { $ne: false }
    });

    if (teamMembers.length === 0) return business.ownerId;

    let leastBusyMember = null;
    let minLeadCount = Infinity;

    for (const member of teamMembers) {
      const leadCount = await Lead.countDocuments({
        businessId: targetBizId,
        assignedTo: member._id,
        status: { $in: ['new', 'follow-up'] }
      });

      if (leadCount < minLeadCount) {
        minLeadCount = leadCount;
        leastBusyMember = member;
      }
    }

    return leastBusyMember?._id || business.ownerId;
  }

  return business.ownerId;
}

/**
 * Determine lead assignment for an Agency Client
 */
async function resolveAgencyClientAssignment(client, agency) {
  const strategy = client.leadAssignment?.mode || 'manual';
  const assignedTeam = client.assignedTeam || [];

  if (assignedTeam.length === 0) {
    console.log(`[AgencyAssignment] No team members assigned to client ${client._id}. Falling back to agency owner.`);
    return agency.ownerId;
  }

  if (strategy === 'manual') {
    // Manual mode: Default to the first team member assigned
    return assignedTeam[0];
  }

  if (strategy === 'round-robin') {
    const teamSize = assignedTeam.length;
    let nextIndex = (client.leadAssignment?.lastAssignedIndex || 0) % teamSize;

    const assignedUser = assignedTeam[nextIndex];

    // Update the lastAssignedIndex for next time
    try {
      // Use direct update to avoid triggering middleware if not needed
      const Client = (await import("@/models/Client")).default;
      await Client.findByIdAndUpdate(client._id, {
        $set: { 'leadAssignment.lastAssignedIndex': (nextIndex + 1) % teamSize }
      });
      console.log(`[AgencyAssignment] Round-robin client ${client.clientName}: Assigned to index ${nextIndex}`);
    } catch (err) {
      console.error('[AgencyAssignment] Error updating index:', err);
    }

    return assignedUser;
  }

  return agency.ownerId;
}

/**
 * Unified Lead Ingestion Engine
 * MANDATORY: Every lead — regardless of source — must pass through this function.
 * 
 * @param {object} payload - The raw lead data
 * @param {string} businessId - The resolved business ID
 * @param {object} metadata - Ingestion metadata (source, type, formId, ip, etc.)
 */
export async function ingestLead(payload, businessId, metadata = {}) {
  try {
    await dbConnect();
    const dbName = mongoose.connection?.name || 'unknown';
    logToFile(`--- INGEST START (DB: ${dbName}) ---`);
    logToFile(`Payload: ${JSON.stringify(payload)}`);
    logToFile(`Metadata: ${JSON.stringify(metadata)}`);

    // 1. Business/Client Verification
    let business = await Business.findById(businessId);
    let client = null;
    let agency = null;

    if (!business) {
      // Check if this is an agency client
      client = await (await import("@/models/Client")).default.findById(businessId);
      if (client) {
        agency = await (await import("@/models/Agency")).default.findById(client.agencyId);
        if (!agency || agency.status !== 'active') {
          logToFile(`ERROR: Agency ${client.agencyId} not found or inactive`);
          throw new Error('Agency is inactive or not found');
        }
      } else {
        logToFile(`ERROR: Workspace ${businessId} not found`);
        throw new Error('Workspace not found');
      }
    } else if (business.status !== 'active') {
      logToFile(`ERROR: Business ${businessId} is inactive`);
      throw new Error('Business is inactive');
    }

    // 2. Quota Enforcement
    if (business) {
      if (business.hasReachedLeadLimit()) {
        logToFile(`ERROR: Monthly lead limit reached for business ${businessId}`);
        throw new Error('Monthly lead limit reached');
      }
    } else if (agency) {
      // Check Agency usage for current month
      const { year, month } = agency.getCurrentBillingMonth();
      const usage = await (await import("@/models/AgencyUsage")).default.getOrCreateForMonth(agency._id, year, month);

      if (usage.usage.leadsUsed >= agency.limits.maxLeadsPerMonth) {
        logToFile(`ERROR: Monthly lead limit reached for agency ${agency._id}`);
        throw new Error('Agency monthly lead limit reached');
      }

      // Store usage object for later increment
      metadata._agencyUsage = usage;
      metadata._agencyId = agency._id;
      metadata._clientId = client._id;
    }

    // 3. Normalization & Validation
    const knownPayloadKeys = new Set([
      'name', 'fullName', 'email', 'phone', 'phoneNumber', 'whatsapp',
      'message', 'note', 'serviceInterest', 'interest', 'sourcePage',
      'eventId', 'metadata', 'source', 'token',
    ]);
    const customFormFields = {};
    for (const [key, value] of Object.entries(payload)) {
      if (!knownPayloadKeys.has(key) && value !== undefined && value !== null && String(value).trim() !== '') {
        customFormFields[key] = value;
      }
    }

    const normalizedData = {
      name: (payload.name || payload.fullName || 'Unknown Lead').trim(),
      email: (payload.email || '').toLowerCase().trim(),
      phone: (payload.phone || payload.phoneNumber || '').replace(/\D/g, ''),
      whatsapp: (payload.whatsapp || payload.phone || '').replace(/\D/g, ''),
      serviceInterest: payload.serviceInterest || payload.interest || customFormFields.interest || 'General Inquiry',
      message: payload.message || payload.note || customFormFields.message || '',
      source: metadata.source || 'website',
      sourceDetails: metadata.sourceDetails || 'Direct Submission',
      formId: metadata.formId || null,
      sourcePage: metadata.sourcePage || payload.sourcePage || '',
      ipAddress: metadata.ipAddress || '',
      eventId: payload.eventId || metadata.eventId || null,
      metadata: {
        ...(metadata.extra || {}),
        ...(payload.metadata || {}),
        ...(Object.keys(customFormFields).length ? { formFields: customFormFields } : {}),
      }
    };

    if (!normalizedData.phone && !normalizedData.email) {
      logToFile('ERROR: Missing phone and email');
      throw new Error('Lead must have either email or phone number');
    }

    // 4. Multi-Tenant Deduplication (within this business/client)
    const orConditions = [];
    if (normalizedData.phone && normalizedData.phone.trim() !== '') orConditions.push({ phone: normalizedData.phone });
    if (normalizedData.email && normalizedData.email.trim() !== '') orConditions.push({ email: normalizedData.email });

    let lead = null;
    if (orConditions.length > 0) {
      const dedupQuery = business
        ? { businessId, $or: orConditions }
        : { clientId: client._id, $or: orConditions };
      lead = await Lead.findOne(dedupQuery);
    }

    if (lead) {
      logToFile(`DEDUPLICATION: Found existing lead ${lead._id}. Updating...`);
      lead.status = 'new';
      lead.receivedAt = new Date();
      lead.message = normalizedData.message;
      await lead.save();
      logToFile(`SUCCESS: Updated lead ${lead._id}`);

      const activityBase = business
        ? { businessId: businessId }
        : { metadata: { agencyLead: true, agencyId: agency._id, clientId: client._id } };

      await Activity.create({
        ...activityBase,
        leadId: lead._id,
        type: 're-engagement',
        description: `Lead re-engaged via ${normalizedData.source}`,
        performedBy: lead.assignedTo,
        metadata: { ...((activityBase.metadata) || {}), source: normalizedData.source, formId: normalizedData.formId }
      });
    } else {
      logToFile('NEW LEAD: No existing lead found. Resolving assignment...');
      // 5. Assignment Resolution
      let assignedTo = metadata.assignedTo || null;
      if (!assignedTo) {
        if (business) {
          assignedTo = await resolveAssignment(businessId, business);
        } else if (client && agency) {
          assignedTo = await resolveAgencyClientAssignment(client, agency);
        } else {
          assignedTo = agency?.ownerId || business?.ownerId;
        }
      }
      logToFile(`Assignment resolved to: ${assignedTo}`);

      // 6. Lead Creation
      try {
        const leadFields = {
          ...normalizedData,
          assignedTo,
          status: 'new',
          receivedAt: new Date()
        };

        if (business) {
          leadFields.businessId = businessId;
        } else {
          leadFields.clientId = client._id;
          leadFields.agencyId = agency._id;
        }

        // Explicitly set eventId if present
        if (normalizedData.eventId) {
          leadFields.eventId = normalizedData.eventId;
        }

        lead = await Lead.create(leadFields);
        logToFile(`SUCCESS: Created new lead ${lead._id}`);

        const verifyLead = await Lead.findById(lead._id);
        if (verifyLead) {
          logToFile(`VERIFIED: Lead ${lead._id} exists in database`);
        } else {
          logToFile(`CRITICAL: Lead ${lead._id} NOT FOUND after creation!`);
        }
      } catch (createError) {
        logToFile(`ERROR creating lead: ${createError.message}`);
        throw createError;
      }

      const activityBase = business
        ? { businessId: businessId }
        : { metadata: { agencyLead: true, agencyId: agency._id, clientId: client._id } };

      // 7. Initial Activity Logs
      await Activity.create({
        ...activityBase,
        leadId: lead._id,
        type: 'lead_created',
        description: `New lead ingested from ${normalizedData.source}`,
        performedBy: assignedTo,
        metadata: { ...((activityBase.metadata) || {}), source: normalizedData.source, formId: normalizedData.formId }
      });

      await Activity.create({
        ...activityBase,
        leadId: lead._id,
        type: 'assigned',
        description: 'Lead automatically assigned',
        performedBy: assignedTo,
        metadata: { ...((activityBase.metadata) || {}), assignedTo, strategy: business?.settings?.assignmentStrategy || 'direct' }
      });

      // 8. Usage Tracking
      if (business) {
        business.incrementLeadCount();
        await business.save();
      } else if (metadata._agencyUsage) {
        await metadata._agencyUsage.incrementLeads(1);
      }
    }

    // 9. Fire Automation (Asynchronous)
    try {
      const activityBase = business
        ? { businessId: businessId }
        : { metadata: { agencyLead: true, agencyId: agency._id, clientId: client._id } };

      // Log that automation is starting
      await Activity.create({
        ...activityBase,
        leadId: lead._id,
        type: 'automation_executed',
        description: 'Automation sequence started...',
        performedBy: lead.assignedTo,
        metadata: { ...((activityBase.metadata) || {}), status: 'processing' }
      });
    } catch (logError) {
      console.error('[IngestLead] Initial automation activity failed:', logError);
    }

    // MANDATORY QUEUE: In Serverless (Vercel), we MUST queue this to avoid execution timeouts.
    try {
      if (lead.eventId) {
        logToFile(`Initiating event sequence for lead ${lead._id}`);
        // We will implement sequence triggering in automationEngine
        await queueAutomation(lead, 'onEventJoined');
      } else {
        await queueAutomation(lead, 'onLeadReceived');
        logToFile(`Automation queued for lead ${lead._id}`);
      }
    } catch (err) {
      logToFile(`Queue Error: ${err.message}`);
      console.error('[IngestLead] Queue Error:', err);
    }

    logToFile('--- INGEST COMPLETE (SUCCESS) ---\n');
    return {
      success: true,
      leadId: lead._id,
      lead, // Return the actual lead document
      isNew: !lead.wasNew ? lead.isNew : false
    };

  } catch (error) {
    logToFile(`FATAL ERROR: ${error.message}\n`);
    console.error('[Lead Ingestion Engine] Error:', error);
    console.error('[Lead Ingestion Engine] Error Stack:', error.stack);
    console.error('[Lead Ingestion Engine] Error Details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}

/**
 * @deprecated Use ingestLead instead. Maintained for temporary backward compatibility.
 */
export async function processNewLead(leadData, businessId, formId = null, assignedTo = null) {
  const metadata = {
    source: leadData.source || 'form',
    formId,
    ipAddress: leadData.ipAddress,
    sourcePage: leadData.sourcePage,
    assignedTo
  };
  return ingestLead(leadData, businessId, metadata);
}

/**
 * Trigger automation evaluation for a lead
 */
export async function triggerAutomationForLead(leadId, businessId, trigger = 'onLeadReceived') {
  try {
    const lead = await Lead.findById(leadId);
    if (lead) {
      await queueAutomation(lead, trigger);
    }
  } catch (error) {
    console.error('[Automation Trigger] Error:', error);
  }
}
