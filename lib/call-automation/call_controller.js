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

      // Try to extract the number that was called (the SIM)
      // Twilio uses ForwardedFrom if a personal number redirects to it
      const businessNumber = payload?.ForwardedFrom || payload?.To || payload?.businessNumber || null;

      // 1. Detect and Store
      const missedCall = await callDetectionService.handleMissedCall(businessId, callerNumber, payload, businessNumber);

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
   * Handle Live Inbound Calls (Forwarded from Personal SIM)
   */
  handleInboundCall: async (req, res) => {
    try {
      const { businessId, callerNumber, payload } = req.body;
      const currentMonth = new Date().toISOString().slice(0, 7);

      // 1. Resolve Personal SIM Number
      const usage = await callRepository.getUsage(businessId, currentMonth);
      const personalNumber = usage?.connectedPhone || payload?.ForwardedFrom || payload?.To || null;

      // 2. Register as "Missed" immediately so it shows in dashboard while live
      const missedCall = await callDetectionService.handleMissedCall(businessId, callerNumber, payload, personalNumber);
      await callRepository.updateMissedCallStatus(missedCall._id, 'processing');

      // 3. Return AI Response Payload (Dynamic based on provider)
      const settings = await callRepository.getBusinessSettings(businessId);
      return res.status(200).json({
        status: 'live',
        businessId,
        missedCallId: missedCall._id,
        config: settings
      });
    } catch (error) {
      console.error('[Controller] Inbound Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * Handle completion of AI conversation (Webhook from AI provider)
   */
  handleCallbackCompletion: async (req, res) => {
    try {
      const { missedCallId, transcription, duration } = req.body;

      // 1. Fetch data
      const missedCall = await callRepository.findMissedCallById(missedCallId);
      if (!missedCall) return res.status(404).json({ error: 'Missed call not found' });

      // 2. Extract Data (Simplified Mock)
      const extractedData = {
        extractedName: "John Doe",
        extractedIntent: transcription || "Interested in services",
        durationSeconds: duration || 45,
        callerNumber: missedCall.callerNumber
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
  },

  /**
   * Webhook: Handle Vapi call completion & recording
   */
  handleVapiStatus: async (req, res) => {
    try {
      const { message } = req.body;
      if (message.type === 'end-of-call-report') {
        const { call, recordingUrl, duration } = message;
        const businessId = call.businessId;
        const leadId = call.leadId;

        if (leadId && recordingUrl) {
          const Activity = (await import('@/models/automation/Activity')).default;
          await Activity.create({
            businessId,
            leadId,
            type: 'contacted',
            description: `Desktop Call Completed (${Math.round(duration)}s)`,
            metadata: {
              durationSeconds: duration,
              recordingUrl,
              channel: 'desktop-dialer',
              provider: 'vapi'
            },
            performedBy: 'system'
          });
        }
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[Vapi Webhook] Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  /**
   * Webhook: Handle Twilio recording availability
   */
  handleTwilioRecording: async (req) => {
    try {
      const { RecordingUrl, CallSid, RecordingDuration } = req.body;
      // We'd need a lookup table for CallSid -> LeadId if LeadId isn't in Twilio metadata
      // For now, we assume the system caches or passes this.
      console.log(`[Twilio Recording] Received for ${CallSid}: ${RecordingUrl}`);
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('[Twilio Webhook] Error:', error);
      return new Response('Error', { status: 500 });
    }
  }
};
