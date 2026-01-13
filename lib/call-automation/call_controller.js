import { callDetectionService } from '@/lib/call-automation/services/call_detection.service';
import { callRulesEngine } from '@/lib/call-automation/automation/call_rules.engine';
import { callCallbackService } from '@/lib/call-automation/services/call_callback.service';
import { callLeadAdapter } from '@/lib/call-automation/adapters/call_lead.adapter';
import { callAssignmentService } from '@/lib/call-automation/services/call_assignment.service';
import { callNotificationService } from '@/lib/call-automation/services/call_notification.service';
import { callRepository } from '@/lib/call-automation/storage/call_repository';

export const callController = {
  /**
   * Main entry point for missed call webhook
   * POST /automation/call-integration
   */
  handleWebhook: async (req, res) => {
    try {
      const { businessId, callerNumber, payload } = req.body;
      
      if (!businessId || !callerNumber) {
        return res.status(400).json({ error: 'Missing businessId or callerNumber' });
      }

      // 1. Detect and Store
      const missedCall = await callDetectionService.handleMissedCall(businessId, callerNumber, payload);

      // 2. Check Rules & Eligibility
      const eligibility = await callRulesEngine.evaluateEligibility(businessId);
      
      if (!eligibility.eligible) {
        console.log(`[Controller] Call ineligible: ${eligibility.reason}`);
        return res.status(200).json({ status: 'ignored', reason: eligibility.reason });
      }

      // 3. Trigger Callback (Simulation of Job/Background task)
      const callbackResult = await callCallbackService.initiateCallback(missedCall);
      
      return res.status(200).json({ 
        status: 'processing', 
        callSid: callbackResult.callSid 
      });

    } catch (error) {
      console.error('[Controller] Webhook Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * Handle completion of AI conversation (Webhook from AI provider)
   */
  handleCallbackCompletion: async (req, res) => {
    try {
      const { missedCallId, name, reason, preferredTime, callSid, duration } = req.body;
      
      // 1. Fetch data
      const missedCall = await callRepository.findMissedCallById(missedCallId);
      if (!missedCall) return res.status(404).json({ error: 'Missed call not found' });

      // 2. Structured Data from AI Flow
      const extractedData = {
        extractedName: name || "Anonymous",
        extractedIntent: reason || "Interested in services",
        preferredTime: preferredTime || "ASAP",
        durationSeconds: duration || 30, // Default for now
        callerNumber: missedCall.callerNumber,
        callSid: callSid
      };

      // 3. Adapter: Create Lead in existing system
      const lead = await callLeadAdapter.createLeadFromCallback(missedCall.businessId, extractedData);

      // 4. Assign Team Member
      await callAssignmentService.assignLead(lead._id, missedCall.businessId);

      // 5. Notify Business
      await callNotificationService.notifyBusiness(missedCall.businessId, lead, extractedData);

      // 6. Finalize Records
      await callRepository.updateMissedCallStatus(missedCallId, 'completed');
      await callRepository.incrementUsage(missedCall.businessId, new Date().toISOString().slice(0, 7), extractedData.durationSeconds);

      return res.status(200).json({ success: true, leadId: lead._id });

    } catch (error) {
      console.error('[Controller] Completion Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * Helper for UI: Get usage and connection info
   */
  getUsageInfo: async (businessId, month) => {
    return await callRepository.getUsage(businessId, month);
  },

  /**
   * Helper for UI: Connect business phone
   */
  connectPhone: async (businessId, month, phone) => {
    return await callRepository.connectPhone(businessId, month, phone);
  },

  /**
   * Helper for UI: Get configuration
   */
  getSettings: async (businessId) => {
    return await callRepository.getBusinessSettings(businessId);
  },

  /**
   * Helper for UI: Update configuration
   */
  updateSettings: async (businessId, settings) => {
    return await callRepository.updateBusinessSettings(businessId, settings);
  }
};
