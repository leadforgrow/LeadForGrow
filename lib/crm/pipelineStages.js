/**
 * Default deal sales pipeline — used after a lead is converted.
 */
export const DEFAULT_DEAL_STAGES = [
  { key: 'discovery', label: 'Discovery', order: 0, color: '#6366f1', probability: 10 },
  { key: 'demo_scheduled', label: 'Demo Scheduled', order: 1, color: '#3b82f6', probability: 25 },
  { key: 'proposal_sent', label: 'Proposal / Quotation Sent', order: 2, color: '#8b5cf6', probability: 40 },
  { key: 'negotiation', label: 'Negotiation', order: 3, color: '#f59e0b', probability: 60 },
  { key: 'contract_sent', label: 'Contract Sent', order: 4, color: '#f97316', probability: 75 },
  { key: 'payment_pending', label: 'Payment Pending', order: 5, color: '#eab308', probability: 90 },
  { key: 'won', label: 'Won', order: 6, color: '#10b981', probability: 100, isWon: true },
  { key: 'lost', label: 'Lost', order: 7, color: '#ef4444', probability: 0, isLost: true },
];

export const STAGE_PROBABILITY = Object.fromEntries(
  DEFAULT_DEAL_STAGES.map((s) => [s.key, s.probability ?? 0])
);

export function stageLabel(key, stages) {
  if (Array.isArray(stages) && stages.length) {
    const found = stages.find((s) => s.key === key);
    if (found?.label) return found.label;
  }
  return DEFAULT_DEAL_STAGES.find((s) => s.key === key)?.label || key?.replace(/_/g, ' ') || 'Unknown';
}
