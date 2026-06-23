/**
 * CRM business settings — pipeline behavior, payment automation, lost reasons.
 */

export const LOST_REASONS = [
  { key: 'price', label: 'Price' },
  { key: 'competitor', label: 'Competitor' },
  { key: 'budget', label: 'Budget' },
  { key: 'no_response', label: 'No Response' },
  { key: 'timing', label: 'Timing' },
  { key: 'not_interested', label: 'Not Interested' },
  { key: 'other', label: 'Other' },
];

export const PAYMENT_ON_CONFIRM_MODES = {
  NOTIFY_SALES: 'notify_sales',
  AUTO_MOVE_WON: 'auto_move_won',
};

export function getCrmSettings(business) {
  const crm = business?.settings?.crm || {};
  const templates = crm.templates || {};
  return {
    paymentOnConfirm: crm.paymentOnConfirm || PAYMENT_ON_CONFIRM_MODES.NOTIFY_SALES,
    autoCreateFollowUpTask: crm.autoCreateFollowUpTask !== false,
    defaultFollowUpHours: crm.defaultFollowUpHours ?? 24,
    notifyTeamOnNewLead: crm.notifyTeamOnNewLead !== false,
    sendWelcomeWhatsApp: crm.sendWelcomeWhatsApp !== false,
    sendWelcomeEmail: crm.sendWelcomeEmail !== false,
    runAiQualificationOnNewLead: crm.runAiQualificationOnNewLead !== false,
    lostNurtureAfterMonths: crm.lostNurtureAfterMonths ?? 3,
    requireLostReason: crm.requireLostReason !== false,
    meetingReminders: {
      hours24: crm.meetingReminders?.hours24 !== false,
      hours1: crm.meetingReminders?.hours1 !== false,
      minutes10: crm.meetingReminders?.minutes10 !== false,
    },
    paymentReminderDays: crm.paymentReminderDays ?? 3,
    templates: {
      welcomeEmail: templates.welcomeEmail || '',
      welcomeWhatsApp: templates.welcomeWhatsApp || '',
      meetingEmail: templates.meetingEmail || '',
      meetingWhatsApp: templates.meetingWhatsApp || '',
      quotationEmail: templates.quotationEmail || '',
      quotationWhatsApp: templates.quotationWhatsApp || '',
      paymentReminderEmail: templates.paymentReminderEmail || '',
      paymentReminderWhatsApp: templates.paymentReminderWhatsApp || '',
    },
  };
}

export default { getCrmSettings, LOST_REASONS, PAYMENT_ON_CONFIRM_MODES };
