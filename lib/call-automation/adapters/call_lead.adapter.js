import { dbConnect } from '@/lib/mongodb';
import { ingestLead } from '@/lib/leadProcessor';

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
      console.log(`[LeadAdapter] Ingesting lead via callback for business ${businessId}`);
      
      const payload = {
        name: callbackData.extractedName || "Unknown Caller",
        phone: callbackData.callerNumber,
        message: `Intent: ${callbackData.extractedIntent}. Preferred Callback: ${callbackData.preferredCallbackTime || 'Not specified'}`
      };

      const metadata = {
        source: 'call',
        sourceDetails: 'AI Callback Breakdown',
        extra: {
          callbackId: callbackData.callbackId,
          missedCallId: callbackData.missedCallId
        }
      };

      const result = await ingestLead(payload, businessId, metadata);
      return result.lead;
    } catch (error) {
      console.error('[LeadAdapter] Error ingesting lead from callback:', error);
      throw error;
    }
  },

  /**
   * Create a lead immediately when a missed call is detected
   */
  createLeadFromMissedCall: async (businessId, callerNumber) => {
    try {
      await dbConnect();
      console.log(`[LeadAdapter] Auto-ingesting lead from missed call: ${callerNumber}`);
      
      const payload = {
        name: "Missed Call Enquiry",
        phone: callerNumber,
        message: 'This lead was automatically created after a missed call was detected on your SIM/Line.'
      };

      const metadata = {
        source: 'call',
        sourceDetails: 'Automatic Missed Call Detection'
      };

      const result = await ingestLead(payload, businessId, metadata);
      return result.lead;
    } catch (error) {
      console.error('[LeadAdapter] Error auto-ingesting lead:', error);
      throw error;
    }
  }
};
