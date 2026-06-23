import mongoose from 'mongoose';

const AiMemorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', index: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    type: {
      type: String,
      enum: ['preference', 'product', 'objection', 'meeting', 'quotation', 'purchase', 'note', 'general'],
      default: 'general',
    },
    key: { type: String, trim: true },
    value: { type: String, required: true },
    confidence: { type: Number, default: 0.8 },
    source: { type: String, enum: ['conversation', 'manual', 'ai', 'crm'], default: 'ai' },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

AiMemorySchema.index({ businessId: 1, leadId: 1, type: 1 });
AiMemorySchema.index({ businessId: 1, contactId: 1 });

export default mongoose.models.AiMemory || mongoose.model('AiMemory', AiMemorySchema);
