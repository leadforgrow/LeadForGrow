import TeamMember from '@/models/automation/TeamMember';
import Lead from '@/models/automation/Lead';

/**
 * Call Automation Assignment Service
 * Assigns team members to leads created from callbacks.
 */
export const callAssignmentService = {
  /**
   * Assign lead to a team member (Round-Robin logic)
   */
  assignLead: async (leadId, businessId) => {
    console.log(`[Assignment] Assigning lead ${leadId} for business ${businessId}`);
    
    // 1. Fetch active team members with auto-assign enabled
    const members = await TeamMember.find({
      businessId,
      active: true,
      autoAssign: true
    }).sort({ 'metrics.totalLeadsHandled': 1 }); // Simple heuristic: least handled first
    
    if (members.length === 0) {
      console.warn(`[Assignment] No active team members found for ${businessId}`);
      return null;
    }
    
    const assignedMember = members[0];
    
    // 2. Update Lead
    await Lead.findByIdAndUpdate(leadId, {
      assignedTo: assignedMember.userId
    });
    
    // 3. Update Team Member Metrics
    await TeamMember.findByIdAndUpdate(assignedMember._id, {
      $inc: { 'metrics.totalLeadsHandled': 1 },
      $set: { 'metrics.lastActivityAt': new Date() }
    });
    
    return assignedMember;
  }
};
