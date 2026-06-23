/**
 * Shared pipeline stage definitions — safe for client and server (no mongoose).
 */
export const DEFAULT_DEAL_STAGES = [
  { key: 'new_lead', label: 'New Lead', order: 0, color: '#94a3b8', probability: 5 },
  { key: 'first_contact', label: 'First Contact', order: 1, color: '#818cf8', probability: 15 },
  { key: 'qualified', label: 'Qualified', order: 2, color: '#6366f1', probability: 20 },
  { key: 'demo_scheduled', label: 'Demo Scheduled', order: 3, color: '#3b82f6', probability: 30 },
  { key: 'demo_completed', label: 'Demo Completed', order: 4, color: '#0ea5e9', probability: 40 },
  { key: 'quotation_sent', label: 'Quotation Sent', order: 5, color: '#8b5cf6', probability: 50 },
  { key: 'follow_up', label: 'Follow-up', order: 6, color: '#a855f7', probability: 55 },
  { key: 'negotiation', label: 'Negotiation', order: 7, color: '#f59e0b', probability: 70 },
  { key: 'decision_pending', label: 'Decision Pending', order: 8, color: '#f97316', probability: 80 },
  { key: 'payment_pending', label: 'Payment Pending', order: 9, color: '#eab308', probability: 90 },
  { key: 'won', label: 'Won', order: 10, color: '#10b981', probability: 100, isWon: true },
  { key: 'lost', label: 'Lost', order: 11, color: '#ef4444', probability: 0, isLost: true },
];

export const STAGE_PROBABILITY = Object.fromEntries(
  DEFAULT_DEAL_STAGES.map((s) => [s.key, s.probability ?? 0])
);

export function stageLabel(key) {
  return DEFAULT_DEAL_STAGES.find((s) => s.key === key)?.label || key?.replace(/_/g, ' ') || 'Unknown';
}
