import { DEFAULT_LEAD_STAGES, LEGACY_LEAD_STATUS_MAP } from '@/lib/crm/leadPipelineStages';
import { LEGACY_DEAL_STAGE_MAP } from '@/lib/crm/stageKeys';

/** @deprecated Use LEGACY_LEAD_STATUS_MAP — kept for imports that expect LEAD_LEGACY_STATUS_MAP */
export const LEAD_LEGACY_STATUS_MAP = {
  ...LEGACY_LEAD_STATUS_MAP,
  converted: 'converted',
};

const STAGE_ORDER = Object.fromEntries(DEFAULT_LEAD_STAGES.map((s) => [s.key, s.order]));
const LABEL_TO_KEY = Object.fromEntries(
  DEFAULT_LEAD_STAGES.map((s) => [s.label.toLowerCase(), s.key])
);

/** Kanban columns and status filters on the Leads module */
export const PIPELINE_STAGES = DEFAULT_LEAD_STAGES.map(({ key, label }) => ({ key, label }));

export const LEAD_PIPELINE_STAGE_KEYS = DEFAULT_LEAD_STAGES.map((s) => s.key);

const BADGE_CLASSES = {
  new: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  contacted: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900',
  qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900',
  nurturing: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
  unqualified: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  lost: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  converted: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
};

export const STATUS_CONFIG = Object.fromEntries(
  DEFAULT_LEAD_STAGES.map((s) => [
    s.key,
    { label: s.label, badge: BADGE_CLASSES[s.key] || BADGE_CLASSES.new },
  ])
);
STATUS_CONFIG.converted = { label: 'Converted', badge: BADGE_CLASSES.converted };

// Legacy display aliases
for (const [legacy, modern] of Object.entries(LEAD_LEGACY_STATUS_MAP)) {
  if (legacy !== modern && STATUS_CONFIG[modern]) {
    STATUS_CONFIG[legacy] = STATUS_CONFIG[modern];
  }
}
// Common legacy keys still stored on old records
STATUS_CONFIG.new_lead = STATUS_CONFIG.new;
STATUS_CONFIG.first_contact = STATUS_CONFIG.contacted;
STATUS_CONFIG.interested = STATUS_CONFIG.nurturing;
STATUS_CONFIG.follow_up = STATUS_CONFIG.nurturing;

export const LEAD_STATUS_ROW_COLORS = Object.fromEntries(
  DEFAULT_LEAD_STAGES.map((s) => [s.key, `${s.color}33`])
);
LEAD_STATUS_ROW_COLORS.converted = '#bbf7d0';
LEAD_STATUS_ROW_COLORS.new_lead = LEAD_STATUS_ROW_COLORS.new;
LEAD_STATUS_ROW_COLORS.first_contact = LEAD_STATUS_ROW_COLORS.contacted;
LEAD_STATUS_ROW_COLORS.contacted = LEAD_STATUS_ROW_COLORS.contacted;
LEAD_STATUS_ROW_COLORS.interested = LEAD_STATUS_ROW_COLORS.nurturing;
LEAD_STATUS_ROW_COLORS['follow-up'] = LEAD_STATUS_ROW_COLORS.nurturing;
LEAD_STATUS_ROW_COLORS.follow_up = LEAD_STATUS_ROW_COLORS.nurturing;

export const LEAD_STATUS_ACCENT_COLORS = Object.fromEntries(
  DEFAULT_LEAD_STAGES.map((s) => [s.key, s.color])
);
LEAD_STATUS_ACCENT_COLORS.converted = '#10b981';
LEAD_STATUS_ACCENT_COLORS.new_lead = LEAD_STATUS_ACCENT_COLORS.new;
LEAD_STATUS_ACCENT_COLORS.first_contact = LEAD_STATUS_ACCENT_COLORS.contacted;

/** Stages where first outreach has happened (legacy helper) */
export const LEAD_CONTACT_STAGES = ['contacted', 'qualified', 'nurturing'];

export function normalizeLeadStatus(status) {
  if (!status) return 'new';
  if (status === 'converted') return 'converted';

  const raw = String(status).trim();
  const slug = raw.toLowerCase().replace(/[\s-]+/g, '_');

  if (LEAD_LEGACY_STATUS_MAP[raw]) return LEAD_LEGACY_STATUS_MAP[raw];
  if (LEAD_LEGACY_STATUS_MAP[slug]) return LEAD_LEGACY_STATUS_MAP[slug];

  // Native lead stages win over legacy deal-pipeline keys (e.g. "lost" exists in both).
  if (STAGE_ORDER[slug] != null) return slug;
  if (LABEL_TO_KEY[raw.toLowerCase()]) return LABEL_TO_KEY[raw.toLowerCase()];

  // Old deal-pipeline values still stored on lead records
  if (LEGACY_DEAL_STAGE_MAP[slug]) {
    if (LEAD_LEGACY_STATUS_MAP[slug]) return LEAD_LEGACY_STATUS_MAP[slug];
    if (slug === 'lost' || slug === 'closed_lost') return 'lost';
    return 'qualified';
  }

  return slug || 'new';
}

/** Kanban column for a lead — lead stages only (deals live in the Deals module). */
export function getLeadKanbanStage(lead) {
  return normalizeLeadStatus(lead?.status);
}

export function isLeadContactStage(status) {
  const key = normalizeLeadStatus(status);
  return LEAD_CONTACT_STAGES.includes(key);
}

const EARLY_PIPELINE = ['new', 'contacted', 'qualified'];

export function validateStageTransition(fromStatus, toStatus) {
  const from = normalizeLeadStatus(fromStatus);
  const to = normalizeLeadStatus(toStatus);
  if (from === to) return { ok: true };
  if (to === 'lost' || to === 'unqualified' || to === 'nurturing' || to === 'converted') return { ok: true };
  const fromIdx = EARLY_PIPELINE.indexOf(from);
  const toIdx = EARLY_PIPELINE.indexOf(to);
  if (fromIdx >= 0 && toIdx >= 0 && toIdx > fromIdx + 1) {
    const next = EARLY_PIPELINE[fromIdx + 1];
    const nextLabel = DEFAULT_LEAD_STAGES.find((s) => s.key === next)?.label || next;
    return { ok: false, message: `Move to ${nextLabel} first` };
  }
  return { ok: true };
}
