import mongoose from 'mongoose';

const FlowVersionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  flowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppFlow',
    required: true,
    index: true,
  },
  version: { type: Number, required: true },
  name: String,
  snapshot: {
    nodes: { type: mongoose.Schema.Types.Mixed, default: [] },
    edges: { type: mongoose.Schema.Types.Mixed, default: [] },
    triggerType: String,
    triggerConfig: mongoose.Schema.Types.Mixed,
  },
  note: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: Boolean, default: false },
}, { timestamps: true });

FlowVersionSchema.index({ flowId: 1, version: -1 }, { unique: true });
FlowVersionSchema.index({ businessId: 1, flowId: 1 });

export default mongoose.models.FlowVersion || mongoose.model('FlowVersion', FlowVersionSchema);
