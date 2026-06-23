import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const CrmCommentSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    entityType: { type: String, enum: ['lead', 'contact', 'company', 'deal', 'task', 'note'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    content: { type: String, required: true, trim: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CrmComment', default: null },
  },
  { timestamps: true }
);

CrmCommentSchema.plugin(baseSchemaPlugin);

CrmCommentSchema.index({ businessId: 1, entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.models.CrmComment || mongoose.model('CrmComment', CrmCommentSchema);
