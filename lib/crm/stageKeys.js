/**
 * Shared deal stage keys and legacy compatibility helpers.
 */

export const WON_STAGES = ['won', 'closed_won'];
export const LOST_STAGES = ['lost', 'closed_lost'];
export const CLOSED_STAGES = [...WON_STAGES, ...LOST_STAGES];

/** Map legacy 5-stage keys to the production default pipeline. */
export const LEGACY_STAGE_MAP = {
  qualification: 'new_lead',
  proposal: 'quotation_sent',
  negotiation: 'negotiation',
  closed_won: 'won',
  closed_lost: 'lost',
};

export function isWonStage(stage) {
  return WON_STAGES.includes(stage);
}

export function isLostStage(stage) {
  return LOST_STAGES.includes(stage);
}

export function isClosedStage(stage) {
  return CLOSED_STAGES.includes(stage);
}

export function normalizeStageKey(stage) {
  return LEGACY_STAGE_MAP[stage] || stage;
}

export function isLegacyPipeline(stages = []) {
  const keys = stages.map((s) => s.key);
  return keys.includes('qualification') || keys.includes('closed_won');
}
