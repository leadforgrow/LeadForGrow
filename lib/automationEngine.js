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
      
      // 1. Fetch the business to get settings and credentials
      const business = await Business.findById(lead.businessId);
      if (!business) return;

      // 2. Find all enabled rules for this business and trigger
      const rules = await AutomationRule.find({
        businessId: lead.businessId,
        enabled: true,
        [`triggers.${trigger}`]: true
      });

      console.log(`[Engine] Found ${rules.length} matching rules`);

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
    try {
      console.log(`[Engine] Executing ${rule.type}: ${rule.name}`);
      const activities = [];

      switch (rule.type) {
        case 'instant_acknowledgement':
          // Handle Email
          if (rule.config.channel === 'email' || rule.config.channel === 'both') {
            const result = await sendLeadMail(lead, business, rule.config.messageTemplate, rule.config.emailSubject);
            
            // Health Pulse: Update Email Status
            if (result.success) {
              business.integrationHealth.email.status = 'healthy';
              business.integrationHealth.email.lastSuccessAt = new Date();
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent personalized acknowledgment email for rule: ${rule.name}`,
                performedBy: business.ownerId,
                metadata: { channel: 'email', ruleId: rule._id }
              });
            } else {
              business.integrationHealth.email.status = 'failing';
              business.integrationHealth.email.lastError = result.error || 'SMTP Connection Failed';
            }
            await business.save();
          }
          
          // Handle WhatsApp
          if (rule.config.channel === 'whatsapp' || rule.config.channel === 'both') {
            const result = await sendAutoWhatsApp(lead, business, rule.config.messageTemplate);
            
            // Health Pulse: Update WhatsApp Status
            if (result.success) {
              business.integrationHealth.whatsapp.status = 'healthy';
              business.integrationHealth.whatsapp.lastSuccessAt = new Date();
              activities.push({
                leadId: lead._id, businessId: business._id,
                type: 'automation_executed',
                description: `Sent automated WhatsApp for rule: ${rule.name}`,
                performedBy: business.ownerId,
                metadata: { channel: 'whatsapp', ruleId: rule._id }
              });
            } else {
              business.integrationHealth.whatsapp.status = 'failing';
              business.integrationHealth.whatsapp.lastError = result.error || 'WhatsApp API Error';
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
          // In a real app, this might send a Slack or Email notification to team members
          console.log(`[Engine] Team notification placeholder for rule: ${rule.name}`);
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
