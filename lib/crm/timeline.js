import Activity from '@/models/automation/Activity';
import { dbConnect } from '@/lib/mongodb';

async function createTimelineActivity(payload) {
  try {
    return await Activity.create(payload);
  } catch (err) {
    if (err?.name !== 'ValidationError') throw err;
    console.warn('[Timeline] Invalid activity type, using automation_executed:', payload.type, err.message);
    return Activity.create({
      ...payload,
      type: 'automation_executed',
      metadata: {
        ...(payload.metadata || {}),
        originalType: payload.type,
      },
    });
  }
}

/**
 * Log a universal timeline event for any CRM entity.
 * Never throws — timeline logging must not break CRM automations.
 */
export async function logTimelineEvent({
  businessId,
  entityType,
  entityId,
  type,
  description,
  performedBy = null,
  metadata = {},
  leadId = null,
  dedupeKey = null,
}) {
  await dbConnect();

  const resolvedLeadId = leadId || (entityType === 'lead' ? entityId : null);

  if (dedupeKey) {
    const existing = await Activity.findOne({
      businessId,
      leadId: resolvedLeadId,
      'metadata.dedupeKey': dedupeKey,
    }).lean();
    if (existing) return existing;
    metadata = { ...metadata, dedupeKey };
  }

  try {
    return await createTimelineActivity({
      businessId,
      entityType,
      entityId,
      leadId: resolvedLeadId,
      type,
      description,
      performedBy,
      metadata,
      performedAt: new Date(),
    });
  } catch (err) {
    console.error('[Timeline] Failed to persist activity:', err.message);
    return null;
  }
}

/**
 * Fetch timeline for any CRM entity.
 */
export async function getEntityTimeline(businessId, entityType, entityId, { limit = 50, skip = 0 } = {}) {
  await dbConnect();

  const query = { businessId, entityType, entityId };

  const [items, total] = await Promise.all([
    Activity.find(query)
      .populate('performedBy', 'firstName lastName email')
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments(query),
  ]);

  return { items, total };
}

/**
 * Fetch business-wide activity feed.
 */
export async function getBusinessTimeline(businessId, { limit = 50, skip = 0, entityType = null } = {}) {
  await dbConnect();

  const query = { businessId };
  if (entityType) query.entityType = entityType;

  const [items, total] = await Promise.all([
    Activity.find(query)
      .populate('performedBy', 'firstName lastName email')
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments(query),
  ]);

  return { items, total };
}

export default { logTimelineEvent, getEntityTimeline, getBusinessTimeline };
