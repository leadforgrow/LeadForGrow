import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const SavedViewSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: { type: String, enum: ['lead', 'contact', 'company', 'deal', 'task'], required: true },
    name: { type: String, required: true, trim: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    sortField: { type: String, default: 'updatedAt' },
    sortDir: { type: String, enum: ['asc', 'desc'], default: 'desc' },
    columns: [{ type: String }],
    isShared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SavedViewSchema.plugin(baseSchemaPlugin);

SavedViewSchema.index({ businessId: 1, entityType: 1, userId: 1 });

export default mongoose.models.SavedView || mongoose.model('SavedView', SavedViewSchema);
