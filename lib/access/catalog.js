/**
 * Enterprise permission catalog — modules, nav mapping, plan tiers.
 */

export const PLAN_TIERS = ['starter', 'growth', 'scale', 'enterprise'];

export const PLAN_TO_TIER = {
  free: 'starter',
  trial: 'starter',
  growth: 'growth',
  pro: 'scale',
  premium: 'scale',
  enterprise: 'enterprise',
  'agency starter': 'enterprise',
  'agency growth': 'enterprise',
  'agency pro': 'enterprise',
};

export const TIER_LABELS = {
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
  enterprise: 'Enterprise',
};

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'manage'];

export const MODULE_GROUPS = [
  {
    id: 'crm',
    label: 'CRM',
    modules: [
      { id: 'crm.dashboard', label: 'Dashboard', navId: 'dashboard' },
      { id: 'crm.leads', label: 'Leads', navId: 'leads' },
      { id: 'crm.deals', label: 'Deals', navId: null },
      { id: 'crm.pipeline', label: 'Pipeline', navId: 'pipeline' },
      { id: 'crm.tasks', label: 'Tasks', navId: 'tasks' },
      { id: 'crm.activities', label: 'Activities', navId: null },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    modules: [
      { id: 'automation.rules', label: 'Automation Rules', navId: 'rules' },
      { id: 'automation.sequences', label: 'Sequences', navId: 'sequences' },
      { id: 'automation.meetings', label: 'Meetings & Scheduling', navId: 'meetings' },
      { id: 'automation.forms', label: 'Forms', navId: 'forms' },
      { id: 'automation.templates', label: 'Email Templates', navId: 'templates' },
      { id: 'automation.chatbot', label: 'Chatbot', navId: 'chatbot' },
      { id: 'automation.call_recovery', label: 'Call Recovery', navId: 'call-recovery' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    modules: [
      { id: 'comm.whatsapp', label: 'WhatsApp Inbox', navId: 'inbox' },
      { id: 'comm.email', label: 'Email', navId: null },
      { id: 'comm.calls', label: 'Calls', navId: null },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    modules: [
      { id: 'reports.analytics', label: 'Analytics', navId: 'reports' },
      { id: 'reports.revenue', label: 'Revenue', navId: null },
      { id: 'reports.team_performance', label: 'Team Performance', navId: null },
      { id: 'reports.events', label: 'Events & Sessions', navId: 'events' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings & Admin',
    modules: [
      { id: 'settings.workspace', label: 'Workspace Settings', navId: 'crm-settings' },
      { id: 'settings.team', label: 'Team & Permissions', navId: 'team' },
      { id: 'settings.billing', label: 'Billing & Usage', navId: null },
      { id: 'settings.integrations', label: 'Integrations', navId: 'integrations' },
      { id: 'settings.api_keys', label: 'API Keys', navId: null },
      { id: 'settings.security', label: 'Security', navId: null },
      { id: 'settings.audit', label: 'Audit Logs', navId: null },
    ],
  },
];

export const FLAT_MODULES = MODULE_GROUPS.flatMap((g) =>
  g.modules.map((m) => ({ ...m, group: g.id, groupLabel: g.label }))
);

export const NAV_ID_TO_MODULE = Object.fromEntries(
  FLAT_MODULES.filter((m) => m.navId).map((m) => [m.navId, m.id])
);

/** Plan-tier feature flags (Level 1) */
export const TIER_FEATURES = {
  starter: {
    ai_assistant: false,
    api_access: false,
    webhooks: false,
    advanced_reports: false,
    sequences: false,
    meetings: true,
    multi_workspace: false,
    custom_roles: false,
    audit_logs: false,
    sso: false,
    ip_restrictions: false,
  },
  growth: {
    ai_assistant: false,
    api_access: false,
    webhooks: false,
    advanced_reports: true,
    sequences: true,
    meetings: true,
    multi_workspace: false,
    custom_roles: true,
    audit_logs: true,
    sso: false,
    ip_restrictions: false,
  },
  scale: {
    ai_assistant: true,
    api_access: true,
    webhooks: true,
    advanced_reports: true,
    sequences: true,
    meetings: true,
    multi_workspace: true,
    custom_roles: true,
    audit_logs: true,
    sso: false,
    ip_restrictions: false,
  },
  enterprise: {
    ai_assistant: true,
    api_access: true,
    webhooks: true,
    advanced_reports: true,
    sequences: true,
    meetings: true,
    multi_workspace: true,
    custom_roles: true,
    audit_logs: true,
    sso: true,
    ip_restrictions: true,
  },
};

/** Module → minimum plan tier required */
export const MODULE_PLAN_REQUIREMENT = {
  'automation.sequences': 'growth',
  'reports.analytics': 'growth',
  'reports.revenue': 'growth',
  'settings.api_keys': 'scale',
  'automation.chatbot': 'growth',
  'settings.audit': 'growth',
};

export const BUILTIN_ROLES = [
  { slug: 'owner', name: 'Owner', systemRole: true, description: 'Full workspace control including billing' },
  { slug: 'admin', name: 'Admin', systemRole: true, description: 'Manage team, settings, and integrations' },
  { slug: 'manager', name: 'Manager', systemRole: true, description: 'Reports, pipelines, and automations' },
  { slug: 'sales_agent', name: 'Sales Agent', systemRole: true, description: 'Leads, inbox, and tasks' },
  { slug: 'support', name: 'Support', systemRole: true, description: 'Inbox and lead view/edit' },
  { slug: 'viewer', name: 'Viewer', systemRole: true, description: 'Read-only access' },
];

function levelToActions(level) {
  if (level === 'full' || level === 'manage') return ['view', 'create', 'edit', 'delete', 'export', 'manage'];
  if (level === 'edit') return ['view', 'create', 'edit'];
  if (level === 'view') return ['view'];
  return [];
}

/** Legacy matrix → action map */
const LEGACY_MATRIX = {
  owner: Object.fromEntries(FLAT_MODULES.map((m) => [m.id, ['view', 'create', 'edit', 'delete', 'export', 'manage']])),
  admin: {
    ...Object.fromEntries(FLAT_MODULES.map((m) => [m.id, ['view', 'create', 'edit', 'delete', 'export', 'manage']])),
    'settings.billing': ['view'],
  },
  manager: {
    'crm.dashboard': ['view'],
    'crm.leads': ['view', 'create', 'edit', 'delete', 'export'],
    'crm.pipeline': ['view', 'create', 'edit'],
    'crm.tasks': ['view', 'create', 'edit', 'delete'],
    'crm.activities': ['view', 'create'],
    'automation.rules': ['view'],
    'automation.meetings': ['view', 'create', 'edit'],
    'comm.whatsapp': ['view', 'create', 'edit'],
    'reports.analytics': ['view', 'export'],
    'reports.team_performance': ['view'],
    'settings.workspace': ['view'],
    'settings.team': ['view'],
  },
  sales_agent: {
    'crm.dashboard': ['view'],
    'crm.leads': ['view', 'create', 'edit'],
    'crm.pipeline': ['view', 'edit'],
    'crm.tasks': ['view', 'create', 'edit'],
    'comm.whatsapp': ['view', 'create', 'edit'],
    'automation.meetings': ['view'],
    'reports.analytics': ['view'],
  },
  support: {
    'crm.leads': ['view', 'edit'],
    'crm.tasks': ['view', 'edit'],
    'comm.whatsapp': ['view', 'create', 'edit'],
  },
  viewer: Object.fromEntries(
    ['crm.dashboard', 'crm.leads', 'crm.pipeline', 'crm.tasks', 'comm.whatsapp', 'reports.analytics'].map(
      (id) => [id, ['view']]
    )
  ),
};

export function getDefaultPermissionsForRole(slug) {
  return LEGACY_MATRIX[slug] || LEGACY_MATRIX.viewer;
}

export function matrixLevelToPermissions(matrix, roleSlug) {
  const row = matrix?.[roleSlug];
  if (!row) return getDefaultPermissionsForRole(roleSlug);
  const out = {};
  for (const mod of FLAT_MODULES) {
    const level = row[mod.id] || row[mod.id.split('.')[1]] || 'none';
    out[mod.id] = levelToActions(level === 'none' ? 'none' : level);
  }
  return out;
}

export function permissionsToMatrix(permissionsMap) {
  const matrix = {};
  for (const [roleSlug, perms] of Object.entries(permissionsMap)) {
    matrix[roleSlug] = {};
    for (const mod of FLAT_MODULES) {
      const acts = perms[mod.id] || [];
      if (acts.includes('manage') || acts.length >= 5) matrix[roleSlug][mod.id] = 'full';
      else if (acts.includes('edit') || acts.includes('create')) matrix[roleSlug][mod.id] = 'edit';
      else if (acts.includes('view')) matrix[roleSlug][mod.id] = 'view';
      else matrix[roleSlug][mod.id] = 'none';
    }
  }
  return matrix;
}

export function tierRank(tier) {
  return PLAN_TIERS.indexOf(tier);
}

export function moduleMeetsPlan(moduleId, userTier) {
  const required = MODULE_PLAN_REQUIREMENT[moduleId];
  if (!required) return { allowed: true };
  if (tierRank(userTier) >= tierRank(required)) return { allowed: true };
  return { allowed: false, requiredTier: required, upgradeLabel: TIER_LABELS[required] };
}
