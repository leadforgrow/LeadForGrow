import mongoose from 'mongoose';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import User from '@/models/User';
import { automationEngine } from './automationEngine';

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
    
    // 1. Business Verification
    const business = await Business.findById(businessId);
    if (!business || business.status !== 'active') {
      logToFile(`ERROR: Business ${businessId} not found or inactive`);
      throw new Error('Business is inactive or not found');
    }
    
    // 2. Quota Enforcement
    if (business.hasReachedLeadLimit()) {
      logToFile(`ERROR: Monthly lead limit reached for business ${businessId}`);
      throw new Error('Monthly lead limit reached');
    }

    // 3. Normalization & Validation
    const normalizedData = {
      name: (payload.name || payload.fullName || 'Unknown Lead').trim(),
      email: (payload.email || '').toLowerCase().trim(),
      phone: (payload.phone || payload.phoneNumber || '').replace(/\D/g, ''),
      whatsapp: (payload.whatsapp || payload.phone || '').replace(/\D/g, ''),
      serviceInterest: payload.serviceInterest || payload.interest || 'General Inquiry',
      message: payload.message || payload.note || '',
      source: metadata.source || 'website',
      sourceDetails: metadata.sourceDetails || 'Direct Submission',
      formId: metadata.formId || null,
      sourcePage: metadata.sourcePage || payload.sourcePage || '',
      ipAddress: metadata.ipAddress || '',
      metadata: { ...metadata.extra, ...payload.metadata }
    };

    if (!normalizedData.phone && !normalizedData.email) {
      logToFile('ERROR: Missing phone and email');
      throw new Error('Lead must have either email or phone number');
    }

    // 4. Multi-Tenant Deduplication (within this business only)
    const orConditions = [];
    if (normalizedData.phone && normalizedData.phone.trim() !== '') orConditions.push({ phone: normalizedData.phone });
    if (normalizedData.email && normalizedData.email.trim() !== '') orConditions.push({ email: normalizedData.email });
    
    let lead = null;
    if (orConditions.length > 0) {
      lead = await Lead.findOne({ businessId, $or: orConditions });
    }

    if (lead) {
      logToFile(`DEDUPLICATION: Found existing lead ${lead._id}. Updating...`);
      lead.status = 'new';
      lead.receivedAt = new Date();
      lead.message = normalizedData.message;
      await lead.save();
      logToFile(`SUCCESS: Updated lead ${lead._id}`);

      await Activity.create({
        businessId,
        leadId: lead._id,
        type: 're-engagement',
        description: `Lead re-engaged via ${normalizedData.source}`,
        performedBy: lead.assignedTo,
        metadata: { source: normalizedData.source, formId: normalizedData.formId }
      });
    } else {
      logToFile('NEW LEAD: No existing lead found. Resolving assignment...');
      // 5. Assignment Resolution
      const assignedTo = await resolveAssignment(businessId, business);
      logToFile(`Assignment resolved to: ${assignedTo}`);

      // 6. Lead Creation
      try {
        lead = await Lead.create({
          ...normalizedData,
          businessId,
          assignedTo,
          status: 'new',
          receivedAt: new Date()
        });
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

      // 7. Initial Activity Logs
      await Activity.create({
        businessId,
        leadId: lead._id,
        type: 'lead_created',
        description: `New lead ingested from ${normalizedData.source}`,
        performedBy: assignedTo,
        metadata: { source: normalizedData.source, formId: normalizedData.formId }
      });

      await Activity.create({
        businessId,
        leadId: lead._id,
        type: 'assigned',
        description: 'Lead automatically assigned',
        performedBy: assignedTo,
        metadata: { assignedTo, strategy: business.settings?.assignmentStrategy }
      });

      // 8. Usage Tracking
      business.incrementLeadCount();
      await business.save();
    }

    // 9. Fire Automation (Asynchronous)
    // We don't await this to ensure the ingestion response is fast
    automationEngine.processLeadTrigger(lead, 'onLeadReceived').catch(err => {
      logToFile(`Automation Error: ${err.message}`);
      console.error('[IngestLead] Automation Error:', err);
    });

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
export async function processNewLead(leadData, businessId, formId = null) {
  const metadata = {
    source: leadData.source || 'form',
    formId,
    ipAddress: leadData.ipAddress,
    sourcePage: leadData.sourcePage
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
      await automationEngine.processLeadTrigger(lead, trigger);
    }
  } catch (error) {
    console.error('[Automation Trigger] Error:', error);
  }
}
