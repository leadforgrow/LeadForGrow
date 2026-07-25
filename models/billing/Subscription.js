import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'growth', 'pro', 'agency'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'incomplete', 'paused'],
      default: 'active',
    },
    provider: {
      type: String,
      enum: ['stripe', 'razorpay', 'manual'],
      default: 'manual',
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    razorpayCustomerId: { type: String },
    razorpaySubscriptionId: { type: String },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialEndsAt: Date,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });
SubscriptionSchema.index({ razorpaySubscriptionId: 1 }, { sparse: true });
SubscriptionSchema.index({ businessId: 1, status: 1 });
SubscriptionSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.Subscription ||
  mongoose.model('Subscription', SubscriptionSchema);
