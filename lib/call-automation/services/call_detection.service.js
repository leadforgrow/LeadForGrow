import { callRepository } from '@/lib/call-automation/storage/call_repository';
import { callLeadAdapter } from '@/lib/call-automation/adapters/call_lead.adapter';

export const callDetectionService = {
  /**
   * Process a captured missed call Event
   * @param {object} callData - Data from telephony provider
   * @returns {Promise<object>} - Created missed call record
   */
  handleMissedCall: async (businessId, callerNumber, rawPayload = {}, businessNumber = null) => {
    try {
      console.log(`[CallDetection] Missed call from ${callerNumber} for business ${businessId} (SIM: ${businessNumber})`);
      
      // 1. Store the missed call record
      const missedCall = await callRepository.createMissedCall({
        businessId,
        callerNumber,
        businessNumber, // The user's personal/business number that was called
        status: 'missed',
        metadata: rawPayload
      });
      
      if (!missedCall) {
        throw new Error('Failed to create missed call record');
      }
      
      // 2. AUTOMATIC AI CALLBACK (Requirement: Any call missed, AI will call and talk)
      try {
        const { callCallbackService } = await import('@/lib/call-automation/services/call_callback.service');
        // We trigger this asynchronously so the webhook can respond quickly
        setTimeout(() => {
          callCallbackService.initiateCallback(missedCall).catch(err => {
            console.error('[CallDetection] Auto-callback initiation failed:', err);
          });
        }, 1000); // 1 second delay feels natural
      } catch (callbackError) {
        console.error('[CallDetection] Failed to load callback service:', callbackError);
      }

      // 3. AUTOMATIC LEAD CREATION (Requirement: No touch lead generation)
      try {
        await callLeadAdapter.createLeadFromMissedCall(businessId, callerNumber);
      } catch (leadError) {
        console.error('[CallDetection] Auto-lead creation failed, but continuing:', leadError);
      }

      console.log(`[CallDetection] Successfully processed missed call: ${missedCall._id}`);
      return missedCall;
    } catch (error) {
      console.error('[CallDetection] Error handling missed call:', error);
      throw error;
    }
  }
};
