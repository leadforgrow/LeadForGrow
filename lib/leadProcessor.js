import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';
import AutomationRule from '@/models/automation/AutomationRule';
import Task from '@/models/automation/Task';
import User from '@/models/User';

/**
 * Lead Processor Service
 * Centralized service for processing new leads with proper assignment, activity logging, and automation triggering
 */

/**
 * Determine lead assignment based on business settings
 */
async function resolveAssignment(businessId, business) {
  await dbConnect();
  
  const strategy = business.settings?.assignmentStrategy || 'solo';
  
  if (strategy === 'solo') {
    // Assign to business owner
    return business.ownerId;
  }
  
  if (strategy === 'round-robin') {
    // Get all active team members for this business
    const teamMembers = await User.find({
      businessId,
      active: true
    }).sort({ lastActivityAt: 1 }); // Least recently active first
    
    if (teamMembers.length === 0) {
      // Fallback to owner
      return business.ownerId;
    }
    
    // Assign to the team member with oldest lastActivityAt
    const assignedUser = teamMembers[0];
    
    // Update their lastActivityAt
    assignedUser.lastActivityAt = new Date();
    await assignedUser.save();
    
    return assignedUser._id;
  }
  
  if (strategy === 'least-busy') {
    // Count pending leads per team member
    const teamMembers = await User.find({
      businessId,
      active: true
    });
    
    if (teamMembers.length === 0) {
      return business.ownerId;
    }
    
    // Find team member with least pending leads
    let leastBusyMember = null;
    let minLeadCount = Infinity;
    
    for (const member of teamMembers) {
      const leadCount = await Lead.countDocuments({
        businessId,
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
  
  // Default fallback
  return business.ownerId;
}

/**
 * Process a new lead
 * This is the main entry point for lead creation
 */
export async function processNewLead(leadData, businessId, formId = null) {
  try {
    await dbConnect();
    
    // 1. Fetch business
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }
    
    // 2. Check if business has reached lead limit
    if (business.hasReachedLeadLimit()) {
      throw new Error('Monthly lead limit reached. Please upgrade your plan.');
    }
    
    // 3. Resolve assignment
    const assignedTo = await resolveAssignment(businessId, business);
    
    // 4. Create lead (with deduplication handling)
    let lead;
    try {
      lead = await Lead.create({
        businessId,
        formId,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        whatsapp: leadData.whatsapp || leadData.phone,
        source: leadData.source || 'form',
        sourceDetails: leadData.sourceDetails,
        sourcePage: leadData.sourcePage,
        ipAddress: leadData.ipAddress,
        serviceInterest: leadData.serviceInterest,
        message: leadData.message,
        priority: leadData.priority || 'medium',
        status: 'new',
        assignedTo,
        receivedAt: new Date(),
        metadata: leadData.metadata || {}
      });
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate lead - return existing
        const existingLead = await Lead.findOne({ businessId, phone: leadData.phone });
        return {
          success: true,
          lead: existingLead,
          isDuplicate: true,
          message: 'Lead already exists'
        };
      }
      throw err;
    }
    
    // 5. Log initial activity
    await Activity.create({
      businessId,
      leadId: lead._id,
      type: 'lead_created',
      description: `New lead received from ${leadData.source || 'form'}${formId ? ' (Form submission)' : ''}`,
      performedBy: assignedTo,
      metadata: {
        source: leadData.source || 'form',
        formId
      }
    });
    
    // 6. Log assignment activity
    await Activity.create({
      businessId,
      leadId: lead._id,
      type: 'assigned',
      description: `Lead automatically assigned`,
      performedBy: assignedTo,
      metadata: {
        assignedTo,
        strategy: business.settings?.assignmentStrategy || 'solo'
      }
    });
    
    // 7. Increment business lead count
    business.incrementLeadCount();
    await business.save();
    
    // 8. Return lead for automation processing
    return {
      success: true,
      lead,
      isDuplicate: false,
      assignedTo
    };
    
  } catch (error) {
    console.error('Lead processing error:', error);
    throw error;
  }
}

/**
 * Trigger automation evaluation for a lead
 * This should be called asynchronously after lead creation
 */
export async function triggerAutomationForLead(leadId, businessId) {
  try {
    await dbConnect();
    
    const lead = await Lead.findById(leadId);
    if (!lead) {
      console.error('Lead not found for automation:', leadId);
      return;
    }
    
    const business = await Business.findById(businessId);
    if (!business) {
      console.error('Business not found for automation:', businessId);
      return;
    }
    
    // Check if business has automation access (Growth+ plan)
    if (business.plan === 'free') {
      console.log('Free plan - skipping automation');
      return;
    }
    
    // Fetch enabled automation rules
    const rules = await AutomationRule.find({
      businessId,
      enabled: true,
      'triggers.onLeadReceived': true
    });
    
    console.log(`Found ${rules.length} automation rules to execute for lead ${leadId}`);
    
    // Execute each rule
    for (const rule of rules) {
      try {
        await executeAutomationRule(rule, lead, business);
      } catch (error) {
        console.error(`Error executing rule ${rule._id}:`, error);
        // Continue with other rules even if one fails
      }
    }
    
  } catch (error) {
    console.error('Automation trigger error:', error);
  }
}

/**
 * Execute a single automation rule
 */
async function executeAutomationRule(rule, lead, business) {
  console.log(`Executing rule: ${rule.name} (${rule.type})`);
  
  switch (rule.type) {
    case 'instant_acknowledgement':
      await executeInstantAcknowledgement(rule, lead, business);
      break;
      
    case 'notify_team':
      await executeTeamNotification(rule, lead, business);
      break;
      
    case 'follow_up_reminder':
      await executeFollowUpReminder(rule, lead, business);
      break;
      
    default:
      console.log(`Rule type ${rule.type} not yet implemented`);
  }
  
  // Update rule execution count
  rule.executionCount += 1;
  rule.lastExecutedAt = new Date();
  await rule.save();
}

/**
 * Execute instant acknowledgement automation
 */
async function executeInstantAcknowledgement(rule, lead, business) {
  // Log the acknowledgement (actual WhatsApp/Email sending will be implemented in Phase 4)
  await Activity.create({
    businessId: business._id,
    leadId: lead._id,
    type: 'contacted_whatsapp',
    description: `Auto-response sent via ${rule.config?.channel || 'WhatsApp'}`,
    performedBy: lead.assignedTo,
    metadata: {
      ruleId: rule._id,
      channel: rule.config?.channel,
      automated: true
    }
  });
  
  console.log(`Instant acknowledgement logged for lead ${lead._id}`);
}

/**
 * Execute team notification automation
 */
async function executeTeamNotification(rule, lead, business) {
  // Log the notification (actual notification sending will be implemented in Phase 4)
  await Activity.create({
    businessId: business._id,
    leadId: lead._id,
    type: 'assigned',
    description: `Team notification sent to assigned member`,
    performedBy: lead.assignedTo,
    metadata: {
      ruleId: rule._id,
      automated: true
    }
  });
  
  console.log(`Team notification logged for lead ${lead._id}`);
}

/**
 * Execute follow-up reminder automation
 */
async function executeFollowUpReminder(rule, lead, business) {
  const delayHours = rule.config?.delayHours || 24;
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + delayHours);
  
  // Create follow-up task
  const task = await Task.create({
    businessId: business._id,
    leadId: lead._id,
    type: 'call',
    title: `Follow up with ${lead.name}`,
    description: `Automated follow-up task created ${delayHours} hours after lead received`,
    dueDate,
    assignedTo: lead.assignedTo,
    status: 'pending'
  });
  
  // Log task creation
  await Activity.create({
    businessId: business._id,
    leadId: lead._id,
    type: 'follow_up_scheduled',
    description: `Follow-up task scheduled for ${dueDate.toLocaleString()}`,
    performedBy: lead.assignedTo,
    metadata: {
      ruleId: rule._id,
      taskId: task._id,
      delayHours,
      automated: true
    }
  });
  
  console.log(`Follow-up task created for lead ${lead._id}, due at ${dueDate}`);
}
