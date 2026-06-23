import mongoose from 'mongoose';

const WorkflowVersionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  sequenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationSequence',
    required: true,
    index: true,
  },
  version: { type: Number, required: true },
  name: String,
  nodes: mongoose.Schema.Types.Mixed,
  edges: mongoose.Schema.Types.Mixed,
  steps: mongoose.Schema.Types.Mixed,
  triggerType: String,
  triggerConfig: mongoose.Schema.Types.Mixed,
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date, default: Date.now },
  changeNote: String,
}, { timestamps: true });

WorkflowVersionSchema.index({ sequenceId: 1, version: -1 });

export default mongoose.models.WorkflowVersion
  || mongoose.model('WorkflowVersion', WorkflowVersionSchema);
