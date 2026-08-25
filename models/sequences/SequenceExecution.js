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
    // 'paused' = human intervention required (a smart-branch pauseOnReply hit).
    // Distinct from 'waiting' (waiting for a scheduled delay to elapse).
    enum: ['pending', 'running', 'waiting', 'pending_approval', 'paused', 'completed', 'failed', 'cancelled'],
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
  testMode: { type: Boolean, default: false },
  debugMode: { type: Boolean, default: false },
  context: mongoose.Schema.Types.Mixed,
  durationMs: Number,
  revenueAttributed: { type: Number, default: 0 },
  variantId: { type: String, default: null },
  pendingApproval: {
    nodeId: String,
    reason: String,
    requestedAt: Date,
    approverRoles: [String],
  },
  skippedSteps: [{ nodeId: String, reason: String }],
}, { timestamps: true });

SequenceExecutionSchema.index({ sequenceId: 1, status: 1 });
SequenceExecutionSchema.index({ businessId: 1, createdAt: -1 });

export default mongoose.models.SequenceExecution
  || mongoose.model('SequenceExecution', SequenceExecutionSchema);
