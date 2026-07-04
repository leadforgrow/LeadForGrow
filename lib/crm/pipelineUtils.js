import { DEFAULT_DEAL_STAGES } from '@/lib/crm/pipelineStages';
import { LEGACY_STAGE_MAP, WON_STAGES, LOST_STAGES } from '@/lib/crm/stageKeys';

/**
 * Resolve pipeline stages — uses DB stages when present, otherwise defaults.
 */
export function resolveStages(stages) {
  if (Array.isArray(stages) && stages.length > 0) return sortStages(stages);
  return [...DEFAULT_DEAL_STAGES];
}

export function sortStages(stages = []) {
  return [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getStageConfig(stages, stageKey) {
  if (!stageKey) return null;
  const list = resolveStages(stages);
  const direct = list.find((s) => s.key === stageKey);
  if (direct) return direct;
  const mapped = LEGACY_STAGE_MAP[stageKey];
  if (mapped) return list.find((s) => s.key === mapped) || null;
  return null;
}

export function getStageLabel(stages, stageKey) {
  const config = getStageConfig(stages, stageKey);
  if (config?.label) return config.label;
  return stageKey?.replace(/_/g, ' ') || 'Unknown';
}

export function getStageProbability(stages, stageKey, dealProbability) {
  if (dealProbability != null && dealProbability !== '') return Number(dealProbability) || 0;
  return getStageConfig(stages, stageKey)?.probability ?? 0;
}

export function isStageWon(stageKey, stages) {
  const config = getStageConfig(stages, stageKey);
  if (config?.isWon) return true;
  return WON_STAGES.includes(stageKey) || stageKey === 'converted';
}

export function isStageLost(stageKey, stages) {
  const config = getStageConfig(stages, stageKey);
  if (config?.isLost) return true;
  return LOST_STAGES.includes(stageKey);
}

export function isStageClosed(stageKey, stages) {
  return isStageWon(stageKey, stages) || isStageLost(stageKey, stages);
}

export function getWonStageKeys(stages) {
  const list = resolveStages(stages);
  const keys = list.filter((s) => s.isWon).map((s) => s.key);
  return keys.length ? keys : [...WON_STAGES, 'converted'];
}

export function getLostStageKeys(stages) {
  const list = resolveStages(stages);
  const keys = list.filter((s) => s.isLost).map((s) => s.key);
  return keys.length ? keys : [...LOST_STAGES];
}

export function getOpenStageKeys(stages) {
  const list = resolveStages(stages);
  return list.filter((s) => !s.isWon && !s.isLost).map((s) => s.key);
}

export function stageBadgeStyle(stageConfig) {
  if (!stageConfig?.color) return null;
  const color = stageConfig.color;
  return {
    backgroundColor: `${color}18`,
    color,
    borderColor: `${color}55`,
  };
}

export function slugifyStageKey(label) {
  return String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || `stage_${Date.now()}`;
}

export function normalizePipelineStages(stages = []) {
  return sortStages(
    stages.map((s, i) => ({
      key: s.key || slugifyStageKey(s.label),
      label: String(s.label || s.key || `Stage ${i + 1}`).trim(),
      order: s.order ?? i,
      color: s.color || '#6366f1',
      probability: Math.min(100, Math.max(0, Number(s.probability) || 0)),
      isWon: Boolean(s.isWon),
      isLost: Boolean(s.isLost),
    }))
  );
}

export function getDefaultStageKey(stages) {
  const list = resolveStages(stages);
  const open = list.find((s) => !s.isWon && !s.isLost);
  return open?.key || list[0]?.key || 'new_lead';
}
