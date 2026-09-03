import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const EmailAccountSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },

    // Ownership. Personal accounts belong to exactly one user; shared/legacy
    // accounts are business-scoped only (userId=null) and access is granted
    // via a separate ACL collection (not built yet — see architecture doc).
    // Nullable on purpose so shared mailboxes fit without a schema migration.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: function requiredUserId() {
        return this.type === 'personal';
      },
    },
    type: {
      type: String,
      enum: ['personal', 'shared', 'legacy'],
      default: 'personal',
      index: true,
    },

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
    // Legacy single-signature field. Kept for backward compat with rows
    // created before multi-signatures shipped. Read as a fallback when
    // `signatures[]` is empty. New writes should use `signatures[]`.
    signature: String,
    // Optional company logo shown above the signature text on outbound mail.
    // Stored as a Cloudinary URL (public — the whole point is embedding in
    // emails that recipients render). Width caps the render size so a huge
    // upload doesn't blow up the recipient's email client.
    signatureLogoUrl: { type: String, trim: true },
    signatureLogoWidth: { type: Number, default: 180 },
    // Multi-signature support: users can save several signatures per
    // mailbox (e.g. "Sales", "HR", "Personal") and pick which to use
    // at compose time. Exactly one entry should have isDefault=true;
    // the PATCH endpoint enforces this on save. Ids are stable so the
    // compose picker can reference them across renders.
    signatures: [
      new mongoose.Schema(
        {
          id: { type: String, required: true },
          name: { type: String, required: true, trim: true, maxlength: 60 },
          html: { type: String, default: '' },
          isDefault: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now },
        },
        { _id: false }
      ),
    ],
    isDefault: { type: Boolean, default: false },
    lastSyncAt: Date,
    syncEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      // 'pending'  → row created but connection not yet tested
      // 'active'   → connected + last operation succeeded
      // 'error'    → last operation failed (auth, network, etc.)
      // 'disconnected' → user disconnected; keep row for history
      // 'archived' → soft-deleted; hidden from lists, kept for FK integrity
      enum: ['pending', 'active', 'error', 'disconnected', 'archived'],
      default: 'pending',
    },
    lastError: String,
  },
  { timestamps: true }
);

EmailAccountSchema.plugin(baseSchemaPlugin);

// One address per business (across all users). Prevents Alice from connecting
// the same alice@acme.com twice, and prevents Bob from re-adding Alice's
// mailbox behind her back.
EmailAccountSchema.index({ businessId: 1, email: 1 }, { unique: true });

// "My accounts" listing — the composer's From-picker filters by this pair.
EmailAccountSchema.index({ businessId: 1, userId: 1 });

// At most one default per user. Partial index so shared accounts (userId=null,
// isDefault possibly true at the business level) don't collide.
EmailAccountSchema.index(
  { businessId: 1, userId: 1, isDefault: 1 },
  {
    unique: true,
    partialFilterExpression: { isDefault: true, userId: { $type: 'objectId' } },
  }
);

/**
 * Resolve the signature HTML to append on outbound mail.
 * Precedence: specific signatureId → default from signatures[] → legacy `signature` → ''.
 * Kept as an instance method so callers don't have to duplicate this logic.
 */
EmailAccountSchema.methods.resolveSignatureHtml = function resolveSignatureHtml(signatureId) {
  const list = Array.isArray(this.signatures) ? this.signatures : [];
  if (signatureId) {
    const picked = list.find((s) => s.id === signatureId);
    if (picked?.html) return picked.html;
  }
  const def = list.find((s) => s.isDefault);
  if (def?.html) return def.html;
  return this.signature || '';
};

export default mongoose.models.EmailAccount || mongoose.model('EmailAccount', EmailAccountSchema);
