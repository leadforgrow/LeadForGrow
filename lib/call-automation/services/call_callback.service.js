import { callTelephonyProvider } from '@/lib/call-automation/providers/call_telephony.provider';
import { callAiProvider } from '@/lib/call-automation/providers/call_ai.provider';
import { callRepository } from '@/lib/call-automation/storage/call_repository';
import Business from '@/models/Business';

export const callCallbackService = {
  /**
   * Initiate the AI callback process
   */
  initiateCallback: async (missedCall) => {
    try {
      console.log(`[CallbackService] Initiating callback for ${missedCall._id}`);
      
      // 1. Prepare AI Script
      const business = await Business.findById(missedCall.businessId);
      const businessName = business?.businessName || "Our Business";
      const script = callAiProvider.generateScript(businessName);
      
      // 2. Trigger Outbound Call
      const callResult = await callTelephonyProvider.makeAiCall(
        missedCall.callerNumber,
        "+1234567890", // Outbound pool number
        "https://api.example.com/voice/script",
        missedCall.businessId
      );
      
      if (callResult.success) {
        // 3. Create callback record
        const callback = await callRepository.createCallback({
          missedCallId: missedCall._id,
          businessId: missedCall.businessId,
          outcome: 'no_answer' // Default, will be updated by webhook
        });
        
        if (!callback) {
          throw new Error('Failed to create callback record');
        }
        
        console.log(`[CallbackService] Created callback record: ${callback._id}`);
        
        // 4. Update missed call status
        await callRepository.updateMissedCallStatus(missedCall._id, 'processing');
      } else {
        console.error('[CallbackService] Call initiation failed:', callResult.error);
      }
      
      return callResult;
    } catch (error) {
      console.error('[CallbackService] Error initiating callback:', error);
      throw error;
    }
  }
};
