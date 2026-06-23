import mongoose from 'mongoose';

const AiSummarySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: {
      type: String,
      enum: ['conversation', 'meeting', 'email', 'daily', 'weekly', 'account', 'deal'],
      required: true,
      index: true,
    },
    entityType: { type: String, enum: ['lead', 'contact', 'company', 'deal', 'conversation', 'meeting', 'business'] },
    entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
    title: String,
    summary: { type: String, required: true },
    keyPoints: [String],
    actionItems: [{ text: String, assignee: String, dueDate: Date }],
    sentiment: String,
    metadata: mongoose.Schema.Types.Mixed,
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AiSummarySchema.index({ businessId: 1, type: 1, generatedAt: -1 });

export default mongoose.models.AiSummary || mongoose.model('AiSummary', AiSummarySchema);
