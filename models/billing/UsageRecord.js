import mongoose from 'mongoose';

const USAGE_METRICS = [
  'leads',
  'whatsapp_conversations',
  'automation_runs',
  'ai_credits',
  'forms',
  'team_seats',
];

const UsageRecordSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    metric: { type: String, enum: USAGE_METRICS, required: true },
    count: { type: Number, default: 1 },
    period: { type: String, required: true }, // YYYY-MM
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UsageRecordSchema.index({ businessId: 1, metric: 1, period: 1 }, { unique: true });

export { USAGE_METRICS };

export async function trackUsage(businessId, metric, count = 1) {
  const period = new Date().toISOString().slice(0, 7);
  const UsageRecord =
    mongoose.models.UsageRecord || mongoose.model('UsageRecord', UsageRecordSchema);

  return UsageRecord.findOneAndUpdate(
    { businessId, metric, period },
    { $inc: { count } },
    { upsert: true, new: true }
  );
}

export async function getUsageSummary(businessId, period = new Date().toISOString().slice(0, 7)) {
  const UsageRecord =
    mongoose.models.UsageRecord || mongoose.model('UsageRecord', UsageRecordSchema);

  const records = await UsageRecord.find({ businessId, period }).lean();
  return records.reduce((acc, r) => {
    acc[r.metric] = r.count;
    return acc;
  }, {});
}

export default mongoose.models.UsageRecord ||
  mongoose.model('UsageRecord', UsageRecordSchema);
