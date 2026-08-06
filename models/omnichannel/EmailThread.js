import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const EmailThreadSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    emailAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAccount', required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    subject: { type: String, trim: true },
    participants: [{ email: String, name: String }],
    externalThreadId: { type: String, index: true },
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
    folder: { type: String, default: 'inbox' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EmailThreadSchema.plugin(baseSchemaPlugin);
EmailThreadSchema.index({ businessId: 1, externalThreadId: 1 }, { unique: true, partialFilterExpression: { externalThreadId: { $type: 'string' } } });

export default mongoose.models.EmailThread || mongoose.model('EmailThread', EmailThreadSchema);
