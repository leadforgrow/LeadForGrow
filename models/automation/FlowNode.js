import mongoose from 'mongoose';

const FlowNodeSchema = new mongoose.Schema({
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
  /** Stable React Flow node id */
  nodeKey: { type: String, required: true },
  type: { type: String, required: true, index: true },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  analytics: {
    entered: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    dropped: { type: Number, default: 0 },
    avgDurationMs: { type: Number, default: 0 },
  },
}, { timestamps: true });

FlowNodeSchema.index({ flowId: 1, nodeKey: 1 }, { unique: true });
FlowNodeSchema.index({ businessId: 1, flowId: 1 });

export default mongoose.models.FlowNode || mongoose.model('FlowNode', FlowNodeSchema);
