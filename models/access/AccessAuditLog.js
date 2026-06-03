import mongoose from 'mongoose';

const AccessAuditLogSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String, trim: true },
    action: {
      type: String,
      enum: [
        'permission_change',
        'role_created',
        'role_updated',
        'role_deleted',
        'member_invited',
        'member_suspended',
        'member_role_changed',
        'export',
        'login',
        'integration_change',
        'billing_change',
        'api_key_created',
        'api_key_revoked',
        'security_change',
      ],
      required: true,
    },
    targetType: { type: String, trim: true },
    targetId: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, trim: true },
  },
  { timestamps: true }
);

AccessAuditLogSchema.index({ businessId: 1, createdAt: -1 });

if (mongoose.models.AccessAuditLog) delete mongoose.models.AccessAuditLog;

export default mongoose.model('AccessAuditLog', AccessAuditLogSchema);
