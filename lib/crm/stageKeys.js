/**
 * Shared deal stage keys and legacy compatibility helpers.
 */

export const WON_STAGES = ['won', 'closed_won'];
export const LOST_STAGES = ['lost', 'closed_lost'];
export const CLOSED_STAGES = [...WON_STAGES, ...LOST_STAGES];

/** Map legacy 5-stage CRM keys to the default deal pipeline. */
export const LEGACY_STAGE_MAP = {
  qualification: 'discovery',
  proposal: 'proposal_sent',
  negotiation: 'negotiation',
  closed_won: 'won',
  closed_lost: 'lost',
};

/** Map the old 12-stage unified pipeline to the 8-stage deal pipeline. */
export const LEGACY_DEAL_STAGE_MAP = {
  new_lead: 'discovery',
  first_contact: 'discovery',
  qualified: 'discovery',
  demo_scheduled: 'demo_scheduled',
  demo_completed: 'demo_scheduled',
  quotation_sent: 'proposal_sent',
  follow_up: 'negotiation',
  decision_pending: 'contract_sent',
  payment_pending: 'payment_pending',
  won: 'won',
  lost: 'lost',
  ...LEGACY_STAGE_MAP,
};

export function isWonStage(stage) {
  return WON_STAGES.includes(stage) || stage === 'won';
}

export function isLostStage(stage) {
  return LOST_STAGES.includes(stage) || stage === 'lost';
}

export function isClosedStage(stage) {
  return CLOSED_STAGES.includes(stage) || stage === 'won' || stage === 'lost';
}

export function normalizeStageKey(stage) {
  return LEGACY_DEAL_STAGE_MAP[stage] || LEGACY_STAGE_MAP[stage] || stage;
}

export function isLegacyPipeline(stages = []) {
  const keys = stages.map((s) => s.key);
  return (
    keys.includes('qualification') ||
    keys.includes('closed_won') ||
    keys.includes('new_lead') ||
    keys.includes('first_contact') ||
    keys.length > 8
  );
}
