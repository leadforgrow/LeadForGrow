import mongoose from 'mongoose';

const MetaWebhookIngressSchema = new mongoose.Schema(
  {
    route: { type: String, required: true, index: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    method: { type: String, default: 'POST' },
    url: { type: String },
    headers: { type: mongoose.Schema.Types.Mixed },
    rawBody: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
    signature: {
      received: { type: String },
      expected: { type: String },
      verified: { type: Boolean },
      secretSource: { type: String },
      candidates: { type: mongoose.Schema.Types.Mixed }
    },
    parsed: {
      object: { type: String },
      entry: { type: mongoose.Schema.Types.Mixed },
      changes: { type: mongoose.Schema.Types.Mixed },
      field: { type: String },
      value: { type: mongoose.Schema.Types.Mixed },
      leadgen_id: { type: String },
      page_id: { type: String },
      form_id: { type: String }
    },
    processing: {
      step: { type: String },
      result: { type: mongoose.Schema.Types.Mixed },
      error: { type: String }
    },
    outcome: {
      type: String,
      enum: ['received', 'success', 'failed', 'noop', 'rejected'],
      default: 'received',
      index: true
    }
  },
  { timestamps: true }
);

MetaWebhookIngressSchema.index({ createdAt: -1 });
MetaWebhookIngressSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.models.MetaWebhookIngress ||
  mongoose.model('MetaWebhookIngress', MetaWebhookIngressSchema);
