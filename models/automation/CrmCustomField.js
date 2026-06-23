import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const CrmCustomFieldSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    entityType: { type: String, enum: ['lead', 'contact', 'company', 'deal'], required: true },
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'url', 'email', 'phone'],
      default: 'text',
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CrmCustomFieldSchema.plugin(baseSchemaPlugin);

CrmCustomFieldSchema.index({ businessId: 1, entityType: 1, key: 1 }, { unique: true });

export default mongoose.models.CrmCustomField || mongoose.model('CrmCustomField', CrmCustomFieldSchema);
