import { callTelephonyProvider } from '@/lib/call-automation/providers/call_telephony.provider';
import { callAiProvider } from '@/lib/call-automation/providers/call_ai.provider';
import { callRepository } from '@/lib/call-automation/storage/call_repository';

export const callCallbackService = {
  /**
   * Initiate the AI callback process
   */
  initiateCallback: async (missedCall) => {
    try {
      console.log(`[CallbackService] Initiating callback for ${missedCall._id}`);
      
      // 1. Prepare AI Script
      // Note: In real app, we'd fetch business name from DB
      const script = callAiProvider.generateScript("Our Business");
      
      // 2. Trigger Outbound Call
      // Ensure we use a reachable URL for Twilio
      const appUrl = process.env.APP_URL || 'https://your-public-url.com'; // User must set this
      const scriptUrl = `${appUrl}/api/automation/webhook/twilio/callback-response?state=init&missedCallId=${missedCallId._id}&businessId=${missedCall.businessId}`;

      const callResult = await callTelephonyProvider.makeAiCall(
        missedCall.callerNumber,
        null, // Provider will fetch from business settings
        scriptUrl,
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
