import { DEFAULT_DEAL_STAGES } from '@/lib/crm/pipelineStages';
import { LEGACY_STAGE_MAP } from '@/lib/crm/stageKeys';

/** Map legacy 6-stage lead statuses to the production 12-stage pipeline. */
export const LEAD_LEGACY_STATUS_MAP = {
  new: 'new_lead',
  contacted: 'first_contact',
  interested: 'qualified',
  'follow-up': 'follow_up',
  converted: 'converted',
  lost: 'lost',
};

const STAGE_ORDER = Object.fromEntries(DEFAULT_DEAL_STAGES.map((s) => [s.key, s.order]));
const LABEL_TO_KEY = Object.fromEntries(
  DEFAULT_DEAL_STAGES.map((s) => [s.label.toLowerCase(), s.key])
);

export const PIPELINE_STAGES = DEFAULT_DEAL_STAGES.map(({ key, label }) => ({ key, label }));

export const LEAD_PIPELINE_STAGE_KEYS = DEFAULT_DEAL_STAGES.map((s) => s.key);

const BADGE_CLASSES = {
  new_lead: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
  first_contact: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900',
  demo_scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
  demo_completed: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  quotation_sent: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
  follow_up: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  negotiation: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
  decision_pending: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900',
  payment_pending: 'bg-lime-50 text-lime-800 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-900',
  won: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  lost: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  converted: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
};

export const STATUS_CONFIG = Object.fromEntries(
  DEFAULT_DEAL_STAGES.map((s) => [
    s.key,
    { label: s.label, badge: BADGE_CLASSES[s.key] || BADGE_CLASSES.new_lead },
  ])
);
STATUS_CONFIG.converted = { label: 'Converted', badge: BADGE_CLASSES.converted };
// Legacy display aliases
for (const [legacy, modern] of Object.entries(LEAD_LEGACY_STATUS_MAP)) {
  if (legacy !== modern && STATUS_CONFIG[modern]) {
    STATUS_CONFIG[legacy] = STATUS_CONFIG[modern];
  }
}

export const LEAD_STATUS_ROW_COLORS = Object.fromEntries(
  DEFAULT_DEAL_STAGES.map((s) => [s.key, `${s.color}33`])
);
LEAD_STATUS_ROW_COLORS.converted = '#bbf7d0';
LEAD_STATUS_ROW_COLORS.new = LEAD_STATUS_ROW_COLORS.new_lead;
LEAD_STATUS_ROW_COLORS.contacted = LEAD_STATUS_ROW_COLORS.first_contact;
LEAD_STATUS_ROW_COLORS.interested = LEAD_STATUS_ROW_COLORS.qualified;
LEAD_STATUS_ROW_COLORS['follow-up'] = LEAD_STATUS_ROW_COLORS.follow_up;

/** Solid accent color per pipeline stage (for borders, dots, etc.) */
export const LEAD_STATUS_ACCENT_COLORS = Object.fromEntries(
  DEFAULT_DEAL_STAGES.map((s) => [s.key, s.color])
);
LEAD_STATUS_ACCENT_COLORS.converted = '#10b981';
LEAD_STATUS_ACCENT_COLORS.new = LEAD_STATUS_ACCENT_COLORS.new_lead;
LEAD_STATUS_ACCENT_COLORS.contacted = LEAD_STATUS_ACCENT_COLORS.first_contact;
LEAD_STATUS_ACCENT_COLORS.interested = LEAD_STATUS_ACCENT_COLORS.qualified;
LEAD_STATUS_ACCENT_COLORS['follow-up'] = LEAD_STATUS_ACCENT_COLORS.follow_up;

export const LEAD_CONTACT_STAGES = [
  'first_contact',
  'demo_scheduled',
  'demo_completed',
  'quotation_sent',
  'follow_up',
  'negotiation',
  'decision_pending',
  'payment_pending',
  'won',
  'contacted', // legacy
];

export function normalizeLeadStatus(status) {
  if (!status) return 'new_lead';

  const raw = String(status).trim();
  const slug = raw.toLowerCase().replace(/[\s-]+/g, '_');

  if (LEAD_LEGACY_STATUS_MAP[raw]) return LEAD_LEGACY_STATUS_MAP[raw];
  if (LEAD_LEGACY_STATUS_MAP[slug]) return LEAD_LEGACY_STATUS_MAP[slug];
  if (LEGACY_STAGE_MAP[slug]) return LEGACY_STAGE_MAP[slug];
  if (STAGE_ORDER[slug] != null) return slug;
  if (LABEL_TO_KEY[raw.toLowerCase()]) return LABEL_TO_KEY[raw.toLowerCase()];

  return slug || 'new_lead';
}

/** Stage used for kanban columns — prefers the furthest pipeline stage between lead status and linked deal. */
export function getLeadKanbanStage(lead) {
  const statusKey = normalizeLeadStatus(lead?.status);
  const dealKey = lead?.dealStage ? normalizeLeadStatus(lead.dealStage) : null;

  if (!dealKey || STAGE_ORDER[dealKey] == null) return statusKey;
  if (STAGE_ORDER[statusKey] == null) return dealKey;

  return STAGE_ORDER[dealKey] > STAGE_ORDER[statusKey] ? dealKey : statusKey;
}

export function isLeadContactStage(status) {
  const key = normalizeLeadStatus(status);
  return LEAD_CONTACT_STAGES.includes(key) || LEAD_CONTACT_STAGES.includes(status);
}

const EARLY_PIPELINE = ['new_lead', 'first_contact', 'qualified'];

export function validateStageTransition(fromStatus, toStatus) {
  const from = normalizeLeadStatus(fromStatus);
  const to = normalizeLeadStatus(toStatus);
  if (from === to) return { ok: true };
  if (to === 'lost' || to === 'converted') return { ok: true };
  const fromIdx = EARLY_PIPELINE.indexOf(from);
  const toIdx = EARLY_PIPELINE.indexOf(to);
  if (fromIdx >= 0 && toIdx >= 0 && toIdx > fromIdx + 1) {
    const next = EARLY_PIPELINE[fromIdx + 1];
    const nextLabel = DEFAULT_DEAL_STAGES.find((s) => s.key === next)?.label || next;
    return { ok: false, message: `Move to ${nextLabel} first` };
  }
  return { ok: true };
}
