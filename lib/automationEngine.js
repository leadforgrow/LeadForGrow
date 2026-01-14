import AutomationRule from '@/models/automation/AutomationRule';
import Business from '@/models/Business';
import Activity from '@/models/automation/Activity';
import Task from '@/models/automation/Task';
import { sendLeadMail } from './integrations/email';
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

      const rules = await AutomationRule.find(query);

      console.log(`[Engine] Matching rules found: ${rules.length}`);

      // 3. Execute each rule
      for (const rule of rules) {
        await automationEngine.executeRule(lead, business, rule);
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
            
            const result = await sendLeadMail(lead, business, rule.config.messageTemplate, rule.config.emailSubject);
            
            console.log(`${logPrefix} sendLeadMail returned:`, result);
            
            // Health Pulse & Activity Log
            if (result.success) {
              console.log(`${logPrefix} ✅ Email sent successfully!`);
              business.integrationHealth.email.status = 'healthy';
              business.integrationHealth.email.lastSuccessAt = new Date();
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent personalized email: "${rule.config.emailSubject || 'Acknowledgment'}"`,
                performedBy: business.ownerId,
                metadata: { channel: 'email', ruleId: rule._id, status: 'success' }
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
                metadata: { channel: 'email', ruleId: rule._id, status: 'failed', error: result.error }
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
            
            const result = await sendAutoWhatsApp(lead, business, rule.config.messageTemplate);
            
            console.log(`${logPrefix} sendAutoWhatsApp returned:`, result);
            
            // Health Pulse & Activity Log
            if (result.success) {
              console.log(`${logPrefix} ✅ WhatsApp sent successfully!`);
              business.integrationHealth.whatsapp.status = 'healthy';
              business.integrationHealth.whatsapp.lastSuccessAt = new Date();
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent automated WhatsApp message`,
                performedBy: business.ownerId,
                metadata: { channel: 'whatsapp', ruleId: rule._id, status: 'success' }
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
                metadata: { channel: 'whatsapp', ruleId: rule._id, status: 'failed', error: result.error }
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
          const task = await Task.create({
            businessId: business._id,
            leadId: lead._id,
            type: 'call', // Required field fixed
            title: `Follow up: ${lead.name}`,
            description: `Automated follow-up task triggered by rule: ${rule.name}`,
            dueDate,
            priority: 'high',
            assignedTo: lead.assignedTo,
            status: 'pending'
          });
          console.log(`[Engine] Task created successfully: ${task._id}`);
          

          activities.push({
            leadId: lead._id, businessId: business._id,
            type: 'task_created',
            description: `Scheduled automated follow-up in ${delayHours} hours`,
            performedBy: business.ownerId,
            metadata: { ruleId: rule._id }
          });
          break;

        case 'notify_team':
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

View details: https://leadforgrow.online/automation/leads/${lead._id}`;

              const result = await sendLeadMail({ email: recipients.join(', '), name: 'Team' }, business, body, subject);
              
              if (result.success) {
                activities.push({
                  leadId: lead._id, businessId: business._id,
                  type: 'automation_executed',
                  description: `Notified team via email (${recipients.length} members)`,
                  performedBy: business.ownerId,
                  metadata: { type: 'team_notification', channel: 'email', status: 'success' }
                });
              }
            }
          }
          break;
      }

      // Update rule execution count
      await AutomationRule.findByIdAndUpdate(rule._id, {
        $inc: { executionCount: 1 },
        lastExecutedAt: new Date()
      });

      // Save activities
      if (activities.length > 0) {
        await Activity.insertMany(activities);
      }
    } catch (error) {
      console.error(`[Engine] Error executing rule ${rule.name}:`, error);
    }
  }
};
