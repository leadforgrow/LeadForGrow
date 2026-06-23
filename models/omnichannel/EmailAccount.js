import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const EmailAccountSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    displayName: String,
    provider: { type: String, enum: ['smtp', 'gmail', 'outlook', 'imap'], default: 'smtp' },
    imap: {
      host: String,
      port: { type: Number, default: 993 },
      secure: { type: Boolean, default: true },
      username: String,
      password: String,
    },
    smtp: {
      host: String,
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      username: String,
      password: String,
    },
    oauth: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
    },
    signature: String,
    isDefault: { type: Boolean, default: false },
    lastSyncAt: Date,
    syncEnabled: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'error', 'disconnected'], default: 'active' },
    lastError: String,
  },
  { timestamps: true }
);

EmailAccountSchema.plugin(baseSchemaPlugin);
EmailAccountSchema.index({ businessId: 1, email: 1 }, { unique: true });

export default mongoose.models.EmailAccount || mongoose.model('EmailAccount', EmailAccountSchema);
