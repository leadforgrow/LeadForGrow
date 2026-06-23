import mongoose from 'mongoose';
import { hashToken } from '@/lib/security/refreshToken';

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

RefreshTokenSchema.statics.store = async function (userId, refreshToken, meta = {}) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });
};

RefreshTokenSchema.statics.isValid = async function (refreshToken) {
  const doc = await this.findOne({
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  return !!doc;
};

RefreshTokenSchema.statics.revoke = async function (refreshToken) {
  return this.updateOne(
    { tokenHash: hashToken(refreshToken) },
    { $set: { revokedAt: new Date() } }
  );
};

RefreshTokenSchema.statics.revokeAllForUser = async function (userId) {
  return this.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

export default mongoose.models.RefreshToken ||
  mongoose.model('RefreshToken', RefreshTokenSchema);
