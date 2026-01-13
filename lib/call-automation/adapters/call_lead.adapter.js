import { dbConnect } from '@/lib/mongodb';
import Lead from '@/models/automation/Lead';
import Activity from '@/models/automation/Activity';

/**
 * Call Automation Lead Adapter
 * Bridge to the existing system. 100% isolated via this adapter.
 */
export const callLeadAdapter = {
  /**
   * Create a new lead from a completed AI callback
   */
  createLeadFromCallback: async (businessId, callbackData) => {
    try {
      await dbConnect();
      console.log(`[LeadAdapter] Creating lead for business ${businessId}`);
      
      const lead = await Lead.create({
        businessId,
        name: callbackData.extractedName || "Unknown Caller",
        phone: callbackData.callerNumber,
        source: 'call',
        sourceDetails: 'AI Callback Breakdown',
        message: `Intent: ${callbackData.extractedIntent}. Preferred Callback: ${callbackData.preferredTime}`,
        status: 'new'
      });
      
      if (!lead) {
        throw new Error('Failed to create lead');
      }
      
      console.log(`[LeadAdapter] Created lead: ${lead._id}`);
      
      // Log activity in existing system
      const activity = await Activity.create({
        leadId: lead._id,
        businessId,
        type: 'automation_executed',
        description: `Lead captured via AI callback after missed call.`,
        metadata: { source: 'call-automation' }
      });
      
      console.log(`[LeadAdapter] Created activity: ${activity._id}`);
      
      return lead;
    } catch (error) {
      console.error('[LeadAdapter] Error creating lead from callback:', error);
      throw error;
    }
  }
};
