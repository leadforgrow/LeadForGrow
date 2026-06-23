import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const NoteVersionSchema = new mongoose.Schema(
  {
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CrmNoteSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    entityType: { type: String, enum: ['lead', 'contact', 'company', 'deal', 'task', 'meeting'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ['plain', 'html'], default: 'plain' },
    pinned: { type: Boolean, default: false },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    versions: [NoteVersionSchema],
    visibility: { type: String, enum: ['team', 'private'], default: 'team' },
  },
  { timestamps: true }
);

CrmNoteSchema.plugin(baseSchemaPlugin);

CrmNoteSchema.index({ businessId: 1, entityType: 1, entityId: 1, createdAt: -1 });
CrmNoteSchema.index({ businessId: 1, pinned: 1 });

export default mongoose.models.CrmNote || mongoose.model('CrmNote', CrmNoteSchema);
