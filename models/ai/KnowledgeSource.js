import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const KnowledgeSourceSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['website', 'pdf', 'docx', 'txt', 'faq', 'catalog', 'company', 'custom'],
      required: true,
      index: true,
    },
    category: { type: String, trim: true, index: true },
    url: String,
    fileUrl: String,
    fileName: String,
    mimeType: String,
    content: String,
    faqs: [{ question: String, answer: String }],
    catalog: [{ name: String, description: String, price: String, sku: String }],
    customInstructions: String,
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'indexing', 'ready', 'error'], default: 'pending', index: true },
    chunkCount: { type: Number, default: 0 },
    lastIndexedAt: Date,
    lastError: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

KnowledgeSourceSchema.plugin(baseSchemaPlugin);
KnowledgeSourceSchema.index({ businessId: 1, type: 1, category: 1 });

export default mongoose.models.KnowledgeSource || mongoose.model('KnowledgeSource', KnowledgeSourceSchema);
