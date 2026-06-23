import Pipeline from '@/models/automation/Pipeline';
import { DEFAULT_DEAL_STAGES } from '@/lib/crm/pipelineStages';
import Deal from '@/models/automation/Deal';
import { dbConnect } from '@/lib/mongodb';
import { isLegacyPipeline, LEGACY_STAGE_MAP } from '@/lib/crm/stageKeys';

/**
 * Upgrade a legacy 5-stage default pipeline to the production 12-stage default.
 */
async function upgradeLegacyDefaultPipeline(pipeline) {
  if (!isLegacyPipeline(pipeline.stages)) return pipeline;

  pipeline.stages = DEFAULT_DEAL_STAGES;
  await pipeline.save();

  for (const [oldKey, newKey] of Object.entries(LEGACY_STAGE_MAP)) {
    await Deal.updateMany(
      { businessId: pipeline.businessId, pipelineId: pipeline._id, stage: oldKey },
      { $set: { stage: newKey } }
    );
  }

  // Deals without pipelineId but legacy stage keys
  for (const [oldKey, newKey] of Object.entries(LEGACY_STAGE_MAP)) {
    await Deal.updateMany(
      { businessId: pipeline.businessId, stage: oldKey },
      { $set: { stage: newKey, pipelineId: pipeline._id } }
    );
  }

  return pipeline;
}

/**
 * Ensure a business has a production-ready default deal pipeline.
 */
export async function ensureDefaultPipeline(businessId) {
  await dbConnect();

  let pipeline = await Pipeline.findOne({ businessId, entityType: 'deal', isDefault: true, archived: false });

  if (!pipeline) {
    pipeline = await Pipeline.create({
      businessId,
      name: 'Sales Pipeline',
      entityType: 'deal',
      isDefault: true,
      stages: DEFAULT_DEAL_STAGES,
    });
    return pipeline;
  }

  if (isLegacyPipeline(pipeline.stages)) {
    pipeline = await upgradeLegacyDefaultPipeline(pipeline);
  }

  return pipeline;
}

/**
 * Get stage config for a pipeline (supports legacy stage keys on deals).
 */
export function getStageByKey(pipeline, stageKey) {
  const direct = pipeline?.stages?.find((s) => s.key === stageKey);
  if (direct) return direct;
  const mapped = LEGACY_STAGE_MAP[stageKey];
  if (mapped) return pipeline?.stages?.find((s) => s.key === mapped) || null;
  return null;
}

export default { ensureDefaultPipeline, getStageByKey };
