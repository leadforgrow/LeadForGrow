import mongoose from 'mongoose';

const IntegrationSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    integrationId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'expired', 'needs_reauth', 'sync_failed', 'rate_limited'],
      default: 'disconnected'
    },
    health: {
      type: String,
      enum: ['healthy', 'warning', 'error', 'unknown'],
      default: 'unknown'
    },
    credentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    config: {
      syncEnabled: { type: Boolean, default: true },
      webhookEnabled: { type: Boolean, default: true },
      autoSync: { type: Boolean, default: false },
      syncIntervalMinutes: { type: Number, default: 60 }
    },
    oauth: {
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
      expiresAt: { type: Date },
      scopes: [{ type: String }],
      connectedEmail: { type: String },
      accountName: { type: String },
      tenantId: { type: String }
    },
    sync: {
      lastSyncedAt: { type: Date },
      lastSyncStatus: { type: String, enum: ['success', 'failed', 'partial', 'pending', null], default: null },
      lastSyncError: { type: String },
      nextSyncAt: { type: Date },
      syncCount: { type: Number, default: 0 }
    },
    webhook: {
      events: [{ type: String }],
      retryRules: {
        maxRetries: { type: Number, default: 3 },
        backoffSeconds: { type: Number, default: 60 }
      },
      customEndpoint: { type: String },
      secretKey: { type: String, select: false }
    },
    accountInfo: {
      label: { type: String },
      externalId: { type: String },
      phone: { type: String },
      workspaceName: { type: String }
    },
    lastTestedAt: { type: Date },
    lastTestResult: {
      success: { type: Boolean },
      message: { type: String }
    },
    connectedAt: { type: Date },
    disconnectedAt: { type: Date },
    connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

IntegrationSchema.index({ businessId: 1, integrationId: 1 }, { unique: true });

export default mongoose.models.Integration || mongoose.model('Integration', IntegrationSchema);
