import { callLimits } from '@/lib/call-automation/config/call_limits.config';
import { callRepository } from '@/lib/call-automation/storage/call_repository';

export const callRulesEngine = {
  /**
   * Check if a business is eligible for an AI callback
   * @param {string} businessId 
   * @returns {Promise<{eligible: boolean, reason?: string}>}
   */
  evaluateEligibility: async (businessId) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // 1. Fetch current usage
    const usage = await callRepository.getUsage(businessId, currentMonth);
    
    if (!usage) {
      return { eligible: true };
    }
    
    // 2. Check hard stop
    if (usage.limitReached) {
      return { eligible: false, reason: 'MONTHLY_LIMIT_REACHED_HARD_STOP' };
    }
    
    // 3. Evaluate against config limits
    // In a real system, these would be fetched from business.settings.callAutomationLimits
    const maxCallbacks = callLimits.DEFAULT_MAX_CALLBACKS_PER_MONTH;
    const maxSeconds = callLimits.DEFAULT_MAX_TOTAL_SECONDS_PER_MONTH;
    
    if (usage.callbacksUsed >= maxCallbacks) {
      await callRepository.setLimitReached(businessId, currentMonth, true);
      return { eligible: false, reason: 'MAX_CALLBACKS_EXCEEDED' };
    }
    
    if (usage.secondsUsed >= maxSeconds) {
      await callRepository.setLimitReached(businessId, currentMonth, true);
      return { eligible: false, reason: 'MAX_TOTAL_SECONDS_EXCEEDED' };
    }
    
    return { eligible: true };
  }
};
