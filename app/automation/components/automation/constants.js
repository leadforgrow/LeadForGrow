import {
  MailPlus,
  BellRing,
  UserRoundPlus,
  Clock3,
  MessageCircleMore,
  RotateCcw,
  CheckSquare,
  FileText,
  CalendarClock,
  ArrowRightCircle,
  Zap
} from 'lucide-react';

export const TEMPLATE_VARIABLES = [
  { key: 'name', label: 'Lead name' },
  { key: 'phone', label: 'Phone' },
  { key: 'serviceInterest', label: 'Service interest' },
  { key: 'assignedAgent', label: 'Assigned agent' }
];

export const CHANNEL_OPTIONS = [
  { id: 'email', label: 'Email' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'both', label: 'Both' }
];

export const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  paused: { label: 'Paused', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  error: { label: 'Error', className: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
  draft: { label: 'Draft', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' }
};

export const FILTER_OPTIONS = [
  { id: 'all', label: 'All automations' },
  { id: 'active', label: 'Active only' },
  { id: 'paused', label: 'Paused only' }
];

export const CREATABLE_TYPES = [
  { id: 'instant_acknowledgement', label: 'Lead welcome message' },
  { id: 'notify_team', label: 'Notify team' },
  { id: 'auto_assign', label: 'Auto-assign leads' },
  { id: 'follow_up_reminder', label: 'Follow-up reminder' },
  { id: 'lost_lead_reengagement', label: 'Missed lead recovery' }
];

export const RULE_ICONS = {
  instant_acknowledgement: MailPlus,
  notify_team: BellRing,
  auto_assign: UserRoundPlus,
  follow_up_reminder: Clock3,
  lost_lead_reengagement: RotateCcw,
  manual_template: FileText
};

export const RULE_ICON_FALLBACK = Zap;

export function getRuleIcon(rule) {
  const type = rule?.type;
  if (RULE_ICONS[type]) return RULE_ICONS[type];

  const name = (rule?.name || '').toLowerCase();
  if (name.includes('welcome') || name.includes('acknowledgement')) return MailPlus;
  if (name.includes('notify')) return BellRing;
  if (name.includes('assign')) return UserRoundPlus;
  if (name.includes('follow') || name.includes('reminder')) return Clock3;
  if (name.includes('whatsapp') || name.includes('reply')) return MessageCircleMore;
  if (name.includes('recovery') || name.includes('recover')) return RotateCcw;
  if (name.includes('task')) return CheckSquare;
  if (name.includes('form') || name.includes('trigger')) return FileText;
  if (name.includes('calendar') || name.includes('event')) return CalendarClock;
  if (name.includes('status')) return ArrowRightCircle;
  return RULE_ICON_FALLBACK;
}

export function getTriggerLabel(rule) {
  const t = rule?.triggers || {};
  if (t.onLeadReceived) return 'New lead';
  if (t.onStatusChange) return 'Status change';
  if (t.onNoResponse) return 'No response';
  return 'Manual';
}

export function getChannelLabel(rule) {
  const ch = rule?.config?.channel;
  if (!ch) return '—';
  if (ch === 'both') return 'Email + WhatsApp';
  if (ch === 'email') return 'Email';
  if (ch === 'whatsapp') return 'WhatsApp';
  return ch;
}

export function getRuleStatus(rule) {
  if (rule?.config?.metaStatus === 'REJECTED') return 'error';
  if (!rule?.enabled) return 'paused';
  if (rule?.config?.metaStatus === 'PENDING') return 'draft';
  return 'active';
}

export function formatLastExecuted(date) {
  if (!date) return 'Never';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function applyPreviewVars(text, sample = {}) {
  if (!text) return '';
  const defaults = {
    name: 'John Doe',
    phone: '+91 98765 43210',
    serviceInterest: 'Business consulting',
    assignedAgent: 'Sarah'
  };
  const vars = { ...defaults, ...sample };
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export function buildEditForm(rule) {
  if (!rule) return null;
  return {
    name: rule.name,
    description: rule.description,
    channel: rule.config?.channel || 'both',
    messageTemplate: rule.config?.messageTemplate || '',
    whatsappTemplate: rule.config?.whatsappTemplate || '',
    whatsappTemplateName: rule.config?.whatsappTemplateName || '',
    whatsappHeaderMedia: rule.config?.whatsappHeaderMedia || '',
    delayHours: rule.config?.delayHours || 0,
    emailSubject: rule.config?.emailSubject || ''
  };
}
