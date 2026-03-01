import AutomationRule from '@/models/automation/AutomationRule';
import Business from '@/models/Business';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import Event from '@/models/automation/Event';
import AutomationSequence from '@/models/automation/AutomationSequence';
import Lead from '@/models/automation/Lead';
import { sendCustomerEmail } from './integrations/email';
import { sendAutoWhatsApp } from './integrations/whatsapp';

/**
 * Main orchestrator for evaluating and executing automation rules
 */
export const automationEngine = {
  /**
   * Trigger automation for a specific lead event
   * @param {object} lead - The lead document
   * @param {string} trigger - The event trigger (e.g., 'onLeadReceived', 'onStatusChange')
   */
  processLeadTrigger: async (lead, trigger) => {
    try {
      console.log(`[Engine] Processing ${trigger} for lead ${lead.name} (${lead._id})`);
      console.log(`[Engine] BusinessId: ${lead.businessId} (Type: ${typeof lead.businessId})`);

      // 1. Fetch the business to get settings and credentials
      const business = await Business.findById(lead.businessId);
      if (!business) {
        console.log(`[Engine] CRITICAL: Business not found for ID: ${lead.businessId}`);
        return;
      }
      console.log(`[Engine] Found business: ${business.businessName}`);

      // 2. Find all enabled rules for this business and trigger
      const query = {
        businessId: lead.businessId,
        enabled: true,
        [`triggers.${trigger}`]: true
      };
      console.log(`[Engine] Executing rules query: ${JSON.stringify(query)}`);

      // Let's also check total rules for this business just to debug
      const totalRules = await AutomationRule.countDocuments({ businessId: lead.businessId });
      console.log(`[Engine] Total rules found for this business (regardless of triggers/enabled): ${totalRules}`);

      console.log('[Engine] DEBUG: Starting simpler rule fetch...');

      // Fetch ALL rules for business bypassing Mongoose Model (Native Driver)
      // We use native collection access to avoid any schema/hydration weirdness that might be hanging
      const allRules = await Business.db.collection('automationrules').find({ businessId: lead.businessId }).toArray();
      console.log(`[Engine] DEBUG: Fetched ${allRules.length} raw rules (via Native Driver).`);

      const rules = allRules.filter(r => r.enabled && r.triggers?.[trigger]);
      console.log(`[Engine] DEBUG: Filtered down to ${rules.length} matching rules.`);

      if (rules.length > 0) {
        rules.forEach(r => console.log(`[Engine] - Will execute: ${r.name} (${r._id})`));
      } else {
        console.log('[Engine] DEBUG: No rules matched filter.');
        allRules.forEach(r => {
          console.log(`[Engine] - Ignored: "${r.name}" (Enabled: ${r.enabled}, ${trigger}: ${r.triggers?.[trigger]})`);
        });
      }

      if (rules.length === 0 && totalRules > 0) {
        console.log('[Engine] ⚠️ DEBUG: Rules exist but none matched query. Checking first 3 rules...');
        const debugRules = await AutomationRule.find({ businessId: lead.businessId }).limit(3);
        debugRules.forEach(r => {
          console.log(`[Engine] - Rule "${r.name}": Enabled=${r.enabled}, Triggers=${JSON.stringify(r.triggers || {})}`);
        });
      }

      if (rules.length > 0) {
        for (const rule of rules) {
          await automationEngine.executeRule(lead, business, rule);
        }
      }

      // 4. Special Trigger: onEventJoined
      if (trigger === 'onEventJoined' && lead.eventId) {
        await automationEngine.startEventSequence(lead, business);
      }
    } catch (error) {
      console.error('[Engine] Error processing trigger:', error);
    }
  },

  /**
   * Execute a specific automation rule
   */
  executeRule: async (lead, business, rule) => {
    const logPrefix = `[AutoEngine:${business.businessName}]`;

    try {
      console.log(`${logPrefix} ========== RULE EXECUTION START ==========`);
      console.log(`${logPrefix} Rule Type: ${rule.type}`);
      console.log(`${logPrefix} Rule Name: ${rule.name}`);
      console.log(`${logPrefix} Lead: ${lead.name} (${lead._id})`);
      console.log(`${logPrefix} Lead Email: ${lead.email}`);

      const activities = [];

      switch (rule.type) {
        case 'instant_acknowledgement':
          console.log(`${logPrefix} Processing INSTANT ACKNOWLEDGEMENT rule...`);

          // Handle Email
          if (rule.config.channel === 'email' || rule.config.channel === 'both') {
            console.log(`${logPrefix} Channel: EMAIL`);
            console.log(`${logPrefix} Email Subject: ${rule.config.emailSubject || 'Acknowledgment'}`);
            console.log(`${logPrefix} Message Template Length: ${rule.config.messageTemplate?.length || 0} chars`);
            console.log(`${logPrefix} Calling sendLeadMail...`);

            const result = await sendCustomerEmail(lead, business, rule.config.messageTemplate, rule.config.emailSubject);

            console.log(`${logPrefix} sendLeadMail returned:`, result);

            // Health Pulse & Activity Log
            if (result.success) {
              console.log(`${logPrefix} ✅ Email sent successfully!`);
              business.integrationHealth.email.status = 'healthy';
              business.integrationHealth.email.lastSuccessAt = new Date();

              // NEW: Persist handshake status on lead
              await Business.db.collection('leads').updateOne(
                { _id: lead._id },
                { $set: { 'metadata.handshakeSent': true } }
              );

              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent personalized email: "${rule.config.emailSubject || 'Acknowledgment'}"`,
                performedBy: business.ownerId,
                metadata: { channel: 'email', ruleId: rule._id, status: 'success' },
                performedAt: new Date()
              });
              console.log(`${logPrefix} Activity logged: Email sent successfully`);
            } else {
              console.log(`${logPrefix} ❌ Email send failed: ${result.error}`);
              business.integrationHealth.email.status = 'failing';
              business.integrationHealth.email.lastError = result.error || 'SMTP Connection Failed';
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Failed to send email: ${result.error || 'SMTP Error'}`,
                performedBy: business.ownerId,
                metadata: { channel: 'email', ruleId: rule._id, status: 'failed', error: result.error },
                performedAt: new Date()
              });
              console.log(`${logPrefix} Activity logged: Email send failure`);
            }

            console.log(`${logPrefix} Saving business health status...`);
            await business.save();
            console.log(`${logPrefix} Business health status saved`);
          }

          // Handle WhatsApp
          if (rule.config.channel === 'whatsapp' || rule.config.channel === 'both') {
            console.log(`${logPrefix} Channel: WHATSAPP`);
            console.log(`${logPrefix} Calling sendAutoWhatsApp...`);

            const whatsappMsg = rule.config.whatsappTemplate || rule.config.messageTemplate;
            const result = await sendAutoWhatsApp(lead, business, whatsappMsg, rule.config.whatsappTemplateName, rule.config.whatsappHeaderMedia);

            console.log(`${logPrefix} sendAutoWhatsApp returned:`, result);

            // Health Pulse & Activity Log
            if (result.success) {
              console.log(`${logPrefix} ✅ WhatsApp sent successfully!`);
              business.integrationHealth.whatsapp.status = 'healthy';
              business.integrationHealth.whatsapp.lastSuccessAt = new Date();

              // NEW: Persist handshake status on lead
              await Business.db.collection('leads').updateOne(
                { _id: lead._id },
                { $set: { 'metadata.handshakeSent': true } }
              );

              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent automated WhatsApp message`,
                performedBy: business.ownerId,
                metadata: { channel: 'whatsapp', ruleId: rule._id, status: 'success' },
                performedAt: new Date()
              });
            } else {
              console.log(`${logPrefix} ❌ WhatsApp send failed: ${result.error}`);
              business.integrationHealth.whatsapp.status = 'failing';
              business.integrationHealth.whatsapp.lastError = result.error || 'WhatsApp API Error';
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Failed to send WhatsApp: ${result.error || 'API Error'}`,
                performedBy: business.ownerId,
                metadata: { channel: 'whatsapp', ruleId: rule._id, status: 'failed', error: result.error },
                performedAt: new Date()
              });
            }
            await business.save();
          }
          break;

        case 'follow_up_reminder':
          // Create an automated follow-up task
          const delayHours = rule.config.delayHours || 0;
          const dueDate = new Date();
          dueDate.setHours(dueDate.getHours() + delayHours);


          console.log(`[Engine] Creating task. AssignedTo: ${lead.assignedTo}, DueDate: ${dueDate}`);
          // Use Native Driver for Task creation to avoid Mongoose Hangs
          const taskData = {
            businessId: business._id,
            leadId: lead._id,
            type: 'call',
            title: `Follow up: ${lead.name}`,
            description: `Automated follow-up task triggered by rule: ${rule.name}`,
            dueDate,
            priority: 'high',
            assignedTo: lead.assignedTo,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const taskRes = await Business.db.collection('tasks').insertOne(taskData);
          console.log(`[Engine] Task created successfully: ${taskRes.insertedId}`);


          activities.push({
            leadId: lead._id, businessId: business._id,
            type: 'task_created',
            description: `Scheduled automated follow-up in ${delayHours} hours`,
            performedBy: business.ownerId,
            metadata: { ruleId: rule._id },
            performedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // NEW: Send Follow-Up Email if configured and delay is 0 (Immediate)
          // For delayed emails, a separate cron job would be needed to pick up pending emails.
          // Here we handle the "Condition" case where delay might be 0 or this is triggered by status change.
          if (rule.config.messageTemplate && delayHours === 0) {
            console.log(`${logPrefix} Sending Immediate Follow-Up Email...`);
            const emailRes = await sendCustomerEmail(lead, business, rule.config.messageTemplate, rule.config.emailSubject || 'Follow Up');

            if (emailRes.success) {
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent follow-up email: "${rule.config.emailSubject}"`,
                performedBy: business.ownerId,
                metadata: { channel: 'email', ruleId: rule._id, status: 'success' },
                performedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              });
              console.log(`${logPrefix} ✅ Follow-up Email sent`);
            } else {
              console.log(`${logPrefix} ❌ Follow-up Email failed: ${emailRes.error}`);
            }
          } else if (rule.config.messageTemplate && delayHours > 0) {
            console.log(`${logPrefix} ℹ️ Follow-up Email configured but has delay (${delayHours}h). Skipping immediate send. (Requires Scheduler)`);
          }

          // Handle WhatsApp Follow-up (Immediate only for now)
          if ((rule.config.channel === 'whatsapp' || rule.config.channel === 'both') && delayHours === 0) {
            console.log(`${logPrefix} Sending Immediate Follow-Up WhatsApp...`);
            const whatsappMsg = rule.config.whatsappTemplate || rule.config.messageTemplate;
            const waResult = await sendAutoWhatsApp(lead, business, whatsappMsg);

            if (waResult.success) {
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent automated follow-up WhatsApp`,
                performedBy: business.ownerId,
                metadata: { channel: 'whatsapp', ruleId: rule._id, status: 'success' },
                performedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              });
              console.log(`${logPrefix} ✅ Follow-up WhatsApp sent`);
            } else {
              console.log(`${logPrefix} ❌ Follow-up WhatsApp failed: ${waResult.error}`);
            }
          }
          break;

        case 'notify_team':
          // ... (existing code, ensure no changes needed here unless blocking)
          // Internal notification to the business team
          if (business.settings?.notifications?.email?.enabled) {
            const recipients = business.settings.notifications.email.recipients || [];
            if (recipients.length > 0) {
              const subject = `🔔 New Lead: ${lead.name}`;
              const body = `You have a new lead from ${lead.source}:
                
Name: ${lead.name}
Email: ${lead.email || 'N/A'}
Phone: ${lead.phone || 'N/A'}
Interest: ${lead.serviceInterest}

View details: https://leadforgrow.com/automation/leads/${lead._id}`;

              console.log(`${logPrefix} Sending team notification to: ${recipients.join(', ')}`);
              const result = await sendCustomerEmail({ email: recipients.join(', '), name: 'Team' }, business, body, subject);

              if (result.success) {
                activities.push({
                  leadId: lead._id, businessId: business._id,
                  type: 'automation_executed',
                  description: `Notified team via email (${recipients.length} members)`,
                  performedBy: business.ownerId,
                  metadata: { type: 'team_notification', channel: 'email', status: 'success' },
                  performedAt: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
                console.log(`${logPrefix} ✅ Team notification sent`);
              } else {
                console.log(`${logPrefix} ❌ Team notification failed: ${result.error}`);
                activities.push({
                  leadId: lead._id, businessId: business._id,
                  type: 'automation_executed',
                  description: `Failed to notify team: ${result.error}`,
                  performedBy: business.ownerId,
                  metadata: { type: 'team_notification', channel: 'email', status: 'failed', error: result.error },
                  performedAt: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
            } else {
              console.log(`${logPrefix} ⚠️ Notification enabled but no recipients configured`);
            }
          } else {
            console.log(`${logPrefix} ℹ️ Team notifications disabled in business settings`);
          }
          break;
      }

      // Update rule execution count (Native Driver)
      await Business.db.collection('automationrules').updateOne(
        { _id: rule._id },
        { $inc: { executionCount: 1 }, $set: { lastExecutedAt: new Date() } }
      );

      // Save activities (Native Driver)
      if (activities.length > 0) {
        await Business.db.collection('activities').insertMany(activities);
      }
    } catch (error) {
      console.error(`[Engine] Error executing rule ${rule.name}:`, error);
    }
  },

  /**
   * Start a sequence for a lead who joined an event
   */
  startEventSequence: async (lead, business) => {
    try {
      console.log(`[Engine] Starting Event Sequence for lead ${lead._id}`);
      const event = await Event.findById(lead.eventId);
      if (!event || !event.sequenceId) {
        console.log(`[Engine] No active sequence for event ${lead.eventId}`);
        return;
      }

      const sequence = await AutomationSequence.findById(event.sequenceId);
      if (!sequence || sequence.steps.length === 0) {
        console.log(`[Engine] Sequence ${event.sequenceId} not found or has no steps`);
        return;
      }

      // Link sequence to lead
      await Lead.findByIdAndUpdate(lead._id, {
        $set: {
          activeSequenceId: sequence._id,
          sequenceStepIndex: 0
        }
      });

      // Execute first step immediately (assuming delay 0 for first step)
      await automationEngine.executeSequenceStep(lead._id, sequence._id, 0);

    } catch (error) {
      console.error('[Engine] startEventSequence error:', error);
    }
  },

  /**
   * Execute a specific step in a sequence
   */
  executeSequenceStep: async (leadId, sequenceId, stepIndex) => {
    try {
      const lead = await Lead.findById(leadId);
      if (!lead || lead.status === 'converted' || lead.archived) {
        console.log(`[Engine] Sequence stopped: Lead ${leadId} is ${lead?.status || 'missing/archived'}`);
        return;
      }

      if (lead.activeSequenceId?.toString() !== sequenceId.toString()) {
        console.log(`[Engine] Lead ${leadId} is no longer in sequence ${sequenceId}`);
        return;
      }

      const sequence = await AutomationSequence.findById(sequenceId);
      const step = sequence?.steps[stepIndex];
      if (!step) return;

      const business = await Business.findById(lead.businessId);

      console.log(`[Engine] Executing sequence ${sequence.name} step ${stepIndex} for ${lead.name}`);

      // Perform action based on step config
      // Note: We use the same message functions as executeRule
      if (step.channel === 'email' || step.channel === 'both') {
        await sendCustomerEmail(lead, business, step.messageTemplate, step.emailSubject || `Follow-up from ${sequence.name}`);
      }

      if (step.channel === 'whatsapp' || step.channel === 'both') {
        await sendAutoWhatsApp(lead, business, step.messageTemplate);
      }

      // Log activity
      await Activity.create({
        leadId: lead._id,
        businessId: business._id,
        type: 'automation_executed',
        description: `Sequence ${sequence.name}: Step ${stepIndex + 1} sent`,
        performedBy: business.ownerId,
        metadata: { sequenceId, stepIndex, channel: step.channel }
      });

      // Schedule next step if available
      const nextStepIndex = stepIndex + 1;
      if (sequence.steps[nextStepIndex]) {
        const nextStep = sequence.steps[nextStepIndex];
        const { queueAutomationStep } = await import('./queue');

        // Update lead's step index
        await Lead.findByIdAndUpdate(lead._id, { $set: { sequenceStepIndex: nextStepIndex } });

        // Queue next job with delay
        await queueAutomationStep(lead, sequenceId, nextStepIndex, nextStep.delayDays * 24 * 60 * 60 * 1000);
      } else {
        // End sequence
        await Lead.findByIdAndUpdate(lead._id, { $unset: { activeSequenceId: 1, sequenceStepIndex: 1 } });
      }

    } catch (error) {
      console.error('[Engine] executeSequenceStep error:', error);
    }
  }
};
