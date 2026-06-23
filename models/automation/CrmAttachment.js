import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const CrmAttachmentSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    entityType: { type: String, enum: ['lead', 'contact', 'company', 'deal', 'task', 'meeting', 'note'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/octet-stream' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CrmAttachmentSchema.plugin(baseSchemaPlugin);

CrmAttachmentSchema.index({ businessId: 1, entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.models.CrmAttachment || mongoose.model('CrmAttachment', CrmAttachmentSchema);
