import AccessAuditLog from '@/models/access/AccessAuditLog';

export async function logAccessEvent({
  businessId,
  actorId,
  actorEmail,
  action,
  description,
  targetType,
  targetId,
  metadata = {},
  ipAddress,
}) {
  try {
    await AccessAuditLog.create({
      businessId,
      actorId,
      actorEmail,
      action,
      description,
      targetType,
      targetId,
      metadata,
      ipAddress,
    });
  } catch (err) {
    console.error('[AccessAudit]', err.message);
  }
}
