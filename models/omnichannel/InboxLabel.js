import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const InboxLabelSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366f1' },
    description: String,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InboxLabelSchema.plugin(baseSchemaPlugin);
InboxLabelSchema.index({ businessId: 1, name: 1 }, { unique: true });

export default mongoose.models.InboxLabel || mongoose.model('InboxLabel', InboxLabelSchema);
