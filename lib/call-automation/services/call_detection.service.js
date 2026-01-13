import { callRepository } from '@/lib/call-automation/storage/call_repository';
import CallMissed from '@/lib/call-automation/domain/call_missed.entity';

export const callDetectionService = {
  /**
   * Process a captured missed call Event
   * @param {object} callData - Data from telephony provider
   * @returns {Promise<object>} - Created missed call record
   */
  handleMissedCall: async (businessId, callerNumber, rawPayload = {}) => {
    try {
      console.log(`[CallDetection] Missed call from ${callerNumber} for business ${businessId}`);
      
      // 1. Deduplication: Check for same caller in last 1 minute
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const existing = await CallMissed.findOne({
        businessId,
        callerNumber,
        createdAt: { $gte: oneMinuteAgo }
      });

      if (existing) {
        console.log(`[CallDetection] Duplicate call detected from ${callerNumber} within 1 min. Skipping.`);
        return existing;
      }

      const missedCall = await callRepository.createMissedCall({
        businessId,
        callerNumber,
        status: 'missed',
        metadata: rawPayload
      });
      
      if (!missedCall) {
        throw new Error('Failed to create missed call record');
      }
      
      console.log(`[CallDetection] Successfully created missed call record: ${missedCall._id}`);
      return missedCall;
    } catch (error) {
      console.error('[CallDetection] Error handling missed call:', error);
      throw error;
    }
  }
};
