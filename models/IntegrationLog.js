import mongoose from 'mongoose';

const IntegrationLogSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    integrationId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['connect', 'disconnect', 'test', 'sync', 'webhook', 'error', 'oauth', 'update'],
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'warning', 'info'],
      default: 'info'
    },
    message: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    durationMs: { type: Number }
  },
  { timestamps: true }
);

IntegrationLogSchema.index({ businessId: 1, integrationId: 1, createdAt: -1 });
IntegrationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 days TTL

export default mongoose.models.IntegrationLog || mongoose.model('IntegrationLog', IntegrationLogSchema);
