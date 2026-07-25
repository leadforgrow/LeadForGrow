import mongoose from 'mongoose';

/**
 * One-time exchange codes for OAuth completion.
 * Keeps JWTs out of redirect URLs: the callback stores the session payload
 * here and the client swaps the short-lived code for it exactly once.
 */
const OAuthExchangeSchema = new mongoose.Schema(
  {
    codeHash: { type: String, required: true, unique: true },
    payload: { type: Object, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

OAuthExchangeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OAuthExchange ||
  mongoose.model('OAuthExchange', OAuthExchangeSchema);
