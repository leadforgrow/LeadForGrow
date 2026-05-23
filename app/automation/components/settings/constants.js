import {
  Building2,
  Users,
  Shield,
  Palette,
  Sliders,
  GitBranch,
  Tags,
  ListTree,
  CheckSquare,
  Bell,
  MessageCircle,
  Webhook,
  Bot,
  Clock,
  Timer,
  UserCheck,
  Sparkles,
  BarChart3,
  CreditCard,
  Key,
  FileText,
  Lock,
  Smartphone,
  Plug,
  Zap,
  Brain,
  Target,
  LayoutGrid,
  Globe,
  Settings2
} from 'lucide-react';

export const SETTINGS_GROUPS = [
  {
    id: 'general',
    label: 'General',
    items: [
      { id: 'business-profile', label: 'Business Profile', href: '/automation/settings/general', icon: Building2, tab: 'profile' },
      { id: 'team-management', label: 'Team Management', href: '/automation/settings/team', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', href: '/automation/settings/team', icon: Shield, tab: 'roles' },
      { id: 'workspace', label: 'Workspace Preferences', href: '/automation/settings/general', icon: Sliders, tab: 'workspace' },
      { id: 'branding', label: 'Branding', href: '/automation/settings/general', icon: Palette, tab: 'branding' }
    ]
  },
  {
    id: 'crm',
    label: 'CRM Settings',
    items: [
      { id: 'lead-stages', label: 'Lead Stages', href: '/automation/settings/crm', icon: GitBranch, tab: 'stages' },
      { id: 'lead-sources', label: 'Lead Sources', href: '/automation/settings/crm', icon: Globe, tab: 'sources' },
      { id: 'custom-fields', label: 'Custom Fields', href: '/automation/settings/crm', icon: ListTree, tab: 'fields' },
      { id: 'tags', label: 'Tags', href: '/automation/settings/crm', icon: Tags, tab: 'tags' },
      { id: 'pipelines', label: 'Pipelines', href: '/automation/settings/crm', icon: LayoutGrid, tab: 'pipelines' },
      { id: 'task-settings', label: 'Task Settings', href: '/automation/settings/crm', icon: CheckSquare, tab: 'tasks' },
      { id: 'notification-rules', label: 'Notification Rules', href: '/automation/settings/crm', icon: Bell, tab: 'notifications' }
    ]
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    items: [
      { id: 'wa-cloud', label: 'WhatsApp Cloud API', href: '/automation/settings/whatsapp', icon: MessageCircle, tab: 'cloud' },
      { id: 'interakt', label: 'Interakt', href: '/automation/settings/whatsapp', icon: MessageCircle, tab: 'interakt' },
      { id: 'templates', label: 'Templates', href: '/automation/settings/whatsapp', icon: FileText, tab: 'templates' },
      { id: 'webhooks', label: 'Webhook Settings', href: '/automation/settings/whatsapp', icon: Webhook, tab: 'webhooks' },
      { id: 'auto-replies', label: 'Auto Replies', href: '/automation/settings/whatsapp', icon: Bot, tab: 'auto-replies' },
      { id: 'conversation-rules', label: 'Conversation Rules', href: '/automation/settings/whatsapp', icon: MessageCircle, tab: 'rules' }
    ]
  },
  {
    id: 'automation',
    label: 'Automation',
    items: [
      { id: 'automation-defaults', label: 'Automation Defaults', href: '/automation/settings/automation', icon: Zap, tab: 'defaults' },
      { id: 'working-hours', label: 'Working Hours', href: '/automation/settings/automation', icon: Clock, tab: 'hours' },
      { id: 'sla-rules', label: 'SLA Rules', href: '/automation/settings/automation', icon: Timer, tab: 'sla' },
      { id: 'follow-up', label: 'Follow-up Rules', href: '/automation/settings/automation', icon: UserCheck, tab: 'followup' },
      { id: 'assignment', label: 'Assignment Logic', href: '/automation/settings/automation', icon: Users, tab: 'assignment' },
      { id: 'ai-suggestions', label: 'AI Suggestions', href: '/automation/settings/automation', icon: Sparkles, tab: 'ai' }
    ]
  },
  {
    id: 'integrations',
    label: 'Integrations',
    items: [
      { id: 'integrations-hub', label: 'App Marketplace', href: '/automation/settings/integrations', icon: Plug }
    ]
  },
  {
    id: 'ai',
    label: 'AI & Analytics',
    items: [
      { id: 'ai-assistant', label: 'AI Assistant', href: '/automation/settings/ai', icon: Brain, tab: 'assistant' },
      { id: 'ai-replies', label: 'AI Reply Suggestions', href: '/automation/settings/ai', icon: Sparkles, tab: 'replies' },
      { id: 'lead-scoring', label: 'Lead Scoring', href: '/automation/settings/ai', icon: Target, tab: 'scoring' },
      { id: 'ai-insights', label: 'AI Insights', href: '/automation/settings/ai', icon: BarChart3, tab: 'insights' },
      { id: 'reporting-prefs', label: 'Reporting Preferences', href: '/automation/settings/ai', icon: Settings2, tab: 'reporting' }
    ]
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      { id: 'plans', label: 'Plans', href: '/automation/settings/billing', icon: CreditCard, tab: 'plans' },
      { id: 'usage', label: 'Usage', href: '/automation/settings/billing', icon: BarChart3, tab: 'usage' },
      { id: 'api-usage', label: 'API Usage', href: '/automation/settings/billing', icon: Zap, tab: 'api' },
      { id: 'invoices', label: 'Invoices', href: '/automation/settings/billing', icon: FileText, tab: 'invoices' },
      { id: 'limits', label: 'Workspace Limits', href: '/automation/settings/billing', icon: Shield, tab: 'limits' }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    items: [
      { id: 'access-control', label: 'Access Control', href: '/automation/settings/security', icon: Lock, tab: 'access' },
      { id: '2fa', label: 'Two-Factor Auth', href: '/automation/settings/security', icon: Shield, tab: '2fa' },
      { id: 'sessions', label: 'Login Sessions', href: '/automation/settings/security', icon: Smartphone, tab: 'sessions' },
      { id: 'audit-logs', label: 'Audit Logs', href: '/automation/settings/security', icon: FileText, tab: 'audit' },
      { id: 'api-tokens', label: 'API Tokens', href: '/automation/settings/security', icon: Key, tab: 'tokens' }
    ]
  }
];

export const SECTION_META = {
  general: { title: 'General Settings', description: 'Business profile, workspace preferences, and branding', color: 'blue' },
  crm: { title: 'CRM Settings', description: 'Configure pipelines, fields, tags, and lead management', color: 'violet' },
  whatsapp: { title: 'WhatsApp Settings', description: 'Messaging channels, templates, and conversation rules', color: 'emerald' },
  automation: { title: 'Automation Settings', description: 'Working hours, SLAs, assignment logic, and defaults', color: 'amber' },
  integrations: { title: 'Integrations', description: 'Connect apps and services to your workspace', color: 'cyan' },
  ai: { title: 'AI & Analytics', description: 'AI assistant, lead scoring, and reporting preferences', color: 'purple' },
  billing: { title: 'Billing', description: 'Plans, usage, invoices, and workspace limits', color: 'orange' },
  security: { title: 'Security', description: 'Access control, sessions, audit logs, and API tokens', color: 'rose' },
  team: { title: 'Team & Roles', description: 'Manage users, roles, permissions, and departments', color: 'indigo' },
  hub: { title: 'Settings', description: 'Manage your workspace, CRM, integrations, and security' }
};

export const SECTION_COLORS = {
  blue: { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', bar: 'bg-blue-500', ring: 'hover:border-blue-200 dark:hover:border-blue-800', glow: 'hover:shadow-blue-100/80 dark:hover:shadow-blue-950/20' },
  violet: { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400', bar: 'bg-violet-500', ring: 'hover:border-violet-200 dark:hover:border-violet-800', glow: 'hover:shadow-violet-100/80 dark:hover:shadow-violet-950/20' },
  emerald: { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', bar: 'bg-emerald-500', ring: 'hover:border-emerald-200 dark:hover:border-emerald-800', glow: 'hover:shadow-emerald-100/80 dark:hover:shadow-emerald-950/20' },
  amber: { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', bar: 'bg-amber-500', ring: 'hover:border-amber-200 dark:hover:border-amber-800', glow: 'hover:shadow-amber-100/80 dark:hover:shadow-amber-950/20' },
  cyan: { icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400', bar: 'bg-cyan-500', ring: 'hover:border-cyan-200 dark:hover:border-cyan-800', glow: 'hover:shadow-cyan-100/80 dark:hover:shadow-cyan-950/20' },
  purple: { icon: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400', bar: 'bg-purple-500', ring: 'hover:border-purple-200 dark:hover:border-purple-800', glow: 'hover:shadow-purple-100/80 dark:hover:shadow-purple-950/20' },
  orange: { icon: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400', bar: 'bg-orange-500', ring: 'hover:border-orange-200 dark:hover:border-orange-800', glow: 'hover:shadow-orange-100/80 dark:hover:shadow-orange-950/20' },
  rose: { icon: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400', bar: 'bg-rose-500', ring: 'hover:border-rose-200 dark:hover:border-rose-800', glow: 'hover:shadow-rose-100/80 dark:hover:shadow-rose-950/20' },
  indigo: { icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400', bar: 'bg-indigo-500', ring: 'hover:border-indigo-200 dark:hover:border-indigo-800', glow: 'hover:shadow-indigo-100/80 dark:hover:shadow-indigo-950/20' }
};

export const SETTINGS_HUB_CARDS = [
  { id: 'general', href: '/automation/settings/general', icon: Building2, color: 'blue', title: 'General', description: 'Business profile, workspace preferences, and branding', count: 5 },
  { id: 'crm', href: '/automation/settings/crm', icon: GitBranch, color: 'violet', title: 'CRM Settings', description: 'Lead stages, pipelines, custom fields, tags, and tasks', count: 7 },
  { id: 'whatsapp', href: '/automation/settings/whatsapp', icon: MessageCircle, color: 'emerald', title: 'WhatsApp', description: 'Cloud API, Interakt, templates, webhooks, and auto-replies', count: 6 },
  { id: 'automation', href: '/automation/settings/automation', icon: Zap, color: 'amber', title: 'Automation', description: 'Working hours, SLA rules, follow-ups, and assignment logic', count: 6 },
  { id: 'integrations', href: '/automation/settings/integrations', icon: Plug, color: 'cyan', title: 'Integrations', description: 'Connect WhatsApp, Meta Ads, Stripe, Zapier, and 20+ apps', count: 25 },
  { id: 'ai', href: '/automation/settings/ai', icon: Brain, color: 'purple', title: 'AI & Analytics', description: 'AI assistant, reply suggestions, lead scoring, and insights', count: 5 },
  { id: 'team', href: '/automation/settings/team', icon: Users, color: 'indigo', title: 'Team & Roles', description: 'Invite users, assign roles, permissions, and departments', count: 4 },
  { id: 'billing', href: '/automation/settings/billing', icon: CreditCard, color: 'orange', title: 'Billing', description: 'Plans, usage, API limits, invoices, and workspace caps', count: 5 },
  { id: 'security', href: '/automation/settings/security', icon: Shield, color: 'rose', title: 'Security', description: 'Access control, 2FA, sessions, audit logs, and API tokens', count: 5 }
];

export function flattenNavItems(groups = SETTINGS_GROUPS) {
  return groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.label, groupId: g.id })));
}

export function searchSettings(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return flattenNavItems().filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
  );
}

export function isSettingsNavActive(pathname, item) {
  const base = item.href.split('?')[0];
  if (item.id === 'team-management') return pathname === '/automation/settings/team' || pathname === '/automation/team';
  return pathname === base || pathname.startsWith(`${base}/`);
}
