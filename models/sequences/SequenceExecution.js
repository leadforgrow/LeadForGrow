import mongoose from 'mongoose';

const ExecutionLogSchema = new mongoose.Schema({
  nodeId: String,
  nodeType: String,
  status: { type: String, enum: ['pending', 'running', 'success', 'failed', 'skipped'], default: 'pending' },
  message: String,
  metadata: mongoose.Schema.Types.Mixed,
  executedAt: { type: Date, default: Date.now },
}, { _id: false });

const SequenceExecutionSchema = new mongoose.Schema({
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
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  automationRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutomationRule' },
  status: {
    type: String,
    enum: ['pending', 'running', 'waiting', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  currentNodeId: { type: String, default: null },
  logs: [ExecutionLogSchema],
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  failedAt: Date,
  lastError: String,
  retryCount: { type: Number, default: 0 },
}, { timestamps: true });

SequenceExecutionSchema.index({ sequenceId: 1, status: 1 });
SequenceExecutionSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.SequenceExecution
  || mongoose.model('SequenceExecution', SequenceExecutionSchema);
