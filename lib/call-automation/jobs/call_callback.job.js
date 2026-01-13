import { callCallbackService } from '@/lib/call-automation/services/call_callback.service';

/**
 * Call Automation - Callback Job
 * Responsible for executing the outbound call.
 * In a production app, this would be a Bull/Sidekiq/Agenda job.
 */
export const callCallbackJob = {
  /**
   * Perform the callback task
   */
  perform: async (missedCall) => {
    console.log(`[Job] Executing callback for missed call ${missedCall._id}`);
    
    try {
      const result = await callCallbackService.initiateCallback(missedCall);
      return result;
    } catch (error) {
      console.error(`[Job] Failed to execute callback:`, error);
      throw error;
    }
  }
};
