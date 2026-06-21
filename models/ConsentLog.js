import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema(
  {
    path: { type: String, trim: true },
    title: { type: String, trim: true },
    durationSec: { type: Number, default: 0 },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConsentLogSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    formToken: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'granted', 'denied'],
      default: 'pending',
      index: true,
    },
    analyticsAllowed: { type: Boolean, default: false },
    marketingAllowed: { type: Boolean, default: false },
    consentVersion: { type: String, default: '1.0' },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    sourcePage: { type: String, trim: true },
    locale: { type: String, trim: true },
    regionHint: { type: String, trim: true },
    pageViews: [PageViewSchema],
    linkedLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

ConsentLogSchema.index({ businessId: 1, visitorId: 1 });
ConsentLogSchema.index({ businessId: 1, status: 1, createdAt: -1 });

export default mongoose.models.ConsentLog || mongoose.model('ConsentLog', ConsentLogSchema);
