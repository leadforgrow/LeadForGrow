/**
 * Business feature & quota catalog — used by admin panel and profile page.
 * Admin overrides via Business.featureFlags (boolean) and Business.quotas (numbers).
 */

export const QUOTA_FIELDS = [
  { key: 'maxLeadsPerMonth', label: 'Max leads / month', group: 'Quotas' },
  { key: 'maxTeamMembers', label: 'Max team members', group: 'Quotas' },
  { key: 'maxForms', label: 'Max forms', group: 'Quotas' },
  { key: 'maxAutomationRules', label: 'Max automation rules', group: 'Quotas' },
];

export const FEATURE_FLAGS = [
  { key: 'crm', label: 'CRM & Pipeline', group: 'Core', default: true },
  { key: 'leads', label: 'Lead Management', group: 'Core', default: true },
  { key: 'deals', label: 'Deals & Pipeline', group: 'Core', default: true },
  { key: 'tasks', label: 'Tasks & Reminders', group: 'Core', default: true },
  { key: 'whatsapp', label: 'WhatsApp Inbox', group: 'Communication', default: true },
  { key: 'instagram', label: 'Instagram DMs', group: 'Communication', default: true },
  { key: 'email', label: 'Email Integration', group: 'Communication', default: true },
  { key: 'automation', label: 'Automation Rules', group: 'Automation', default: true },
  { key: 'sequences', label: 'Sequences & Workflows', group: 'Automation', default: true },
  { key: 'broadcasts', label: 'Broadcasts', group: 'Automation', default: true },
  { key: 'chatbot', label: 'Website Chatbot', group: 'Automation', default: true },
  { key: 'aiAssistant', label: 'AI Assistant', group: 'AI', default: true },
  { key: 'aiReply', label: 'AI Reply Suggestions', group: 'AI', default: true },
  { key: 'aiQualification', label: 'AI Lead Qualification', group: 'AI', default: false },
  { key: 'callAutomation', label: 'Call Automation', group: 'AI', default: true },
  { key: 'analytics', label: 'Analytics & Reports', group: 'Reports', default: true },
  { key: 'revenueIntelligence', label: 'Revenue Intelligence', group: 'Reports', default: false },
  { key: 'integrations', label: 'Integrations Hub', group: 'Platform', default: true },
  { key: 'apiAccess', label: 'API Access', group: 'Platform', default: false },
  { key: 'webhooks', label: 'Webhooks', group: 'Platform', default: false },
  { key: 'teamMembers', label: 'Team Management', group: 'Platform', default: true },
  { key: 'websites', label: 'Website Builder', group: 'Platform', default: true },
];

export function getDefaultFeatureFlags() {
  return Object.fromEntries(FEATURE_FLAGS.map((f) => [f.key, f.default]));
}

/** Merge plan defaults with admin overrides (null/undefined = use default). */
export function resolveFeatureFlags(business) {
  const defaults = getDefaultFeatureFlags();
  const overrides = business?.featureFlags || {};
  const resolved = { ...defaults };
  for (const [key, val] of Object.entries(overrides)) {
    if (typeof val === 'boolean') resolved[key] = val;
  }
  if (business?.revenueIntelligenceActive) resolved.revenueIntelligence = true;
  if (business?.settings?.ai?.enabled === false) {
    resolved.aiAssistant = false;
    resolved.aiReply = false;
  }
  return resolved;
}

export function resolveQuotas(business) {
  const q = business?.quotas || {};
  return {
    maxLeadsPerMonth: q.maxLeadsPerMonth ?? 100,
    maxTeamMembers: q.maxTeamMembers ?? 1,
    maxForms: q.maxForms ?? 1,
    maxAutomationRules: q.maxAutomationRules ?? 3,
  };
}

export function groupFeatures(flags) {
  const groups = {};
  for (const f of FEATURE_FLAGS) {
    if (!groups[f.group]) groups[f.group] = [];
    groups[f.group].push({ ...f, enabled: flags[f.key] ?? f.default });
  }
  return groups;
}
