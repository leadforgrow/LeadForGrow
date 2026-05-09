import AutomationRule from '../../models/automation/AutomationRule';
import Business from '../../models/Business';
import { sendAutoWhatsApp } from '../integrations/whatsapp';
import { sendResendEmail } from '../resend';

/**
 * Automation Engine - Production Core
 * Handles rule evaluation and execution
 */
export const automationEngine = {
  /**
   * Triggers all applicable rules for a new lead
   */
  async triggerForNewLead(lead, businessId) {
    console.log(`[AutomationEngine] Evaluating rules for Lead: ${lead._id} (Business: ${businessId})`);

    try {
      // 1. Fetch Business Credentials for Sending
      const business = await Business.findById(businessId).select('+integrationCredentials');
      if (!business) return;

      // 2. Fetch Active Rules
      const rules = await AutomationRule.find({
        businessId,
        enabled: true,
        'triggers.onLeadReceived': true
      });

      console.log(`[AutomationEngine] Found ${rules.length} active rules for new leads`);

      for (const rule of rules) {
        try {
          if (rule.type === 'instant_acknowledgement') {
            await this.executeInstantAcknowledgement(rule, lead, business);
          }

          if (rule.type === 'auto_assign') {
            await this.executeAutoAssignment(rule, lead, business);
          }

          // Increment execution count
          await AutomationRule.findByIdAndUpdate(rule._id, {
            $inc: { executionCount: 1 },
            lastExecutedAt: new Date()
          });

        } catch (ruleError) {
          console.error(`[AutomationEngine] Error executing rule ${rule.name}:`, ruleError);
        }
      }
    } catch (error) {
      console.error('[AutomationEngine] Fatal Error:', error);
    }
  },

  /**
   * Executes Instant Acknowledgement (Email + WhatsApp)
   */
  async executeInstantAcknowledgement(rule, lead, business) {
    const { config } = rule;
    const channel = config.channel || 'both';

    // Personalize Message (Basic placeholder replacement)
    const personalize = (text) => {
      if (!text) return '';
      return text
        .replace(/{{name}}/g, lead.name || 'Customer')
        .replace(/{{businessName}}/g, business.businessName)
        .replace(/{{service}}/g, lead.serviceInterest || 'our services');
    };

    // 1. Execute WhatsApp Template
    if ((channel === 'whatsapp' || channel === 'both') && config.whatsappTemplateName) {
      console.log(`[AutomationEngine] Sending WhatsApp Template: ${config.whatsappTemplateName}`);

      const whatsappCreds = business.integrationCredentials?.whatsapp;
      if (whatsappCreds?.enabled) {
        // Fetch the template details to pass dynamic language and components
        const AutomationRuleModel = (await import('../../models/automation/AutomationRule')).default;
        const templateRule = await AutomationRuleModel.findOne({
            businessId: business._id,
            name: config.whatsappTemplateName,
            type: 'manual_template'
        });

        await sendAutoWhatsApp(
            lead,
            business,
            null, // No static text required for templates
            config.whatsappTemplateName,
            null, // headerMedia
            templateRule?.config?.language || 'en',
            templateRule?.config?.metaComponents || null
        );
      }
    }

    // 2. Execute Email Acknowledgement
    if ((channel === 'email' || channel === 'both') && lead.email) {
      console.log(`[AutomationEngine] Sending Acknowledgement Email to: ${lead.email}`);

      const emailContent = personalize(config.messageTemplate || 'Thank you for your interest!');
      const subject = personalize(config.emailSubject || `Message from ${business.businessName}`);

      await sendResendEmail({
        to: lead.email,
        subject,
        html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello ${lead.name || 'Customer'},</h2>
          <p>${emailContent}</p>
          <br/>
          <p>Best regards,<br/><strong>${business.businessName} Team</strong></p>
        </div>`
      });
    }
  },

  /**
   * Executes Round-Robin or Specific Lead Assignment
   */
  async executeAutoAssignment(rule, lead, business) {
    const { config } = rule;
    const Lead = (await import('../../models/automation/Lead')).default;
    const User = (await import('../../models/User')).default;

    // 1. Skip if lead is already assigned (returning lead protection)
    if (lead.assignedTo) {
      console.log(`[Assignment] Skipping: Lead ${lead._id} already assigned to ${lead.assignedTo}`);
      return;
    }

    let targetUserId = null;

    if (config.assignmentRule === 'specific-member') {
      targetUserId = config.assignToUserId;
    } 
    else if (config.assignmentRule === 'round-robin') {
      // 2. Round-Robin Logic
      // Get all team members for this business
      const team = await User.find({ businessId: business._id, active: true }).sort({ createdAt: 1 });
      
      if (team.length === 0) {
        console.log(`[Assignment] No active team members found for business ${business._id}`);
        return;
      }

      // Get rotation state from business metadata
      let lastIndex = business.metadata?.get('lastRoundRobinIndex') || 0;
      let nextIndex = (lastIndex + 1) % team.length;

      targetUserId = team[nextIndex]._id;

      // Update rotation state
      const BusinessModel = (await import('../../models/Business')).default;
      await BusinessModel.findByIdAndUpdate(business._id, {
        $set: { 'metadata.lastRoundRobinIndex': nextIndex }
      });

      console.log(`[Assignment] Round-Robin: Rotating from index ${lastIndex} to ${nextIndex}. Assigned to: ${team[nextIndex].email}`);
    }

    // 3. Finalize Assignment
    if (targetUserId) {
      await Lead.findByIdAndUpdate(lead._id, {
        $set: { assignedTo: targetUserId }
      });
      console.log(`[Assignment] Success: Lead ${lead._id} assigned to User ${targetUserId}`);
    }
  }
};
