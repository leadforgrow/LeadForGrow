import { dbConnect } from '@/lib/mongodb';

const AuditLogSchema = {
  businessId: { type: 'ObjectId', ref: 'Business', index: true },
  userId: { type: 'ObjectId', ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  resource: String,
  resourceId: String,
  ipAddress: String,
  userAgent: String,
  metadata: { type: 'Mixed', default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
};

let AuditLog = null;

async function getModel() {
  if (AuditLog) return AuditLog;
  const mongoose = (await import('mongoose')).default;
  await dbConnect();
  AuditLog =
    mongoose.models.AuditLog ||
    mongoose.model('AuditLog', new mongoose.Schema(AuditLogSchema, { collection: 'audit_logs' }));
  return AuditLog;
}

export async function logAudit({
  businessId,
  userId,
  action,
  resource,
  resourceId,
  ipAddress,
  userAgent,
  metadata = {},
}) {
  try {
    const Model = await getModel();
    await Model.create({
      businessId,
      userId,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (err) {
    console.error('[AuditLog]', err.message);
  }
}

export async function logAuthEvent(req, action, userId, businessId) {
  return logAudit({
    businessId,
    userId,
    action,
    resource: 'auth',
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  });
}
