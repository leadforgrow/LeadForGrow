import mongoose from 'mongoose';
import crypto from 'crypto';

const ApiKeySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    keyPrefix: { type: String, required: true },
    keyHash: { type: String, required: true, select: false },
    scopes: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUsedAt: { type: Date },
    usageCount: { type: Number, default: 0 },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Auth lookups are by keyHash — must be indexed
ApiKeySchema.index({ keyHash: 1 }, { unique: true, sparse: true });

ApiKeySchema.statics.hashKey = function (raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

ApiKeySchema.statics.generateKey = function () {
  const raw = `lfg_${crypto.randomBytes(24).toString('hex')}`;
  return { raw, prefix: raw.slice(0, 12), hash: ApiKeySchema.statics.hashKey(raw) };
};

if (mongoose.models.ApiKey) delete mongoose.models.ApiKey;

export default mongoose.model('ApiKey', ApiKeySchema);
