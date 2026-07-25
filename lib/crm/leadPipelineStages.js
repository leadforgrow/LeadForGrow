/**
 * Lead qualification stages — separate from the deal sales pipeline.
 * Leads stay here until explicitly converted to a Deal.
 */
export const DEFAULT_LEAD_STAGES = [
  { key: 'new', label: 'New', order: 0, color: '#94a3b8' },
  { key: 'contacted', label: 'Contacted', order: 1, color: '#818cf8' },
  { key: 'qualified', label: 'Qualified', order: 2, color: '#6366f1' },
  { key: 'nurturing', label: 'Nurturing', order: 3, color: '#a855f7' },
  { key: 'unqualified', label: 'Unqualified', order: 4, color: '#64748b' },
  { key: 'lost', label: 'Lost', order: 5, color: '#ef4444', isLost: true },
];

export const LEAD_STAGE_KEYS = DEFAULT_LEAD_STAGES.map((s) => s.key);

/** Map historical lead status values to the default lead pipeline. */
export const LEGACY_LEAD_STATUS_MAP = {
  new_lead: 'new',
  first_contact: 'contacted',
  interested: 'nurturing',
  follow_up: 'nurturing',
  'follow-up': 'nurturing',
  demo_scheduled: 'qualified',
  demo_completed: 'qualified',
  quotation_sent: 'qualified',
  negotiation: 'qualified',
  decision_pending: 'qualified',
  payment_pending: 'qualified',
  won: 'qualified',
  lost: 'lost',
  closed_lost: 'lost',
  closed_won: 'qualified',
  unqualified: 'unqualified',
};
