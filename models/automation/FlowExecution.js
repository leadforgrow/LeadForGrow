import mongoose from 'mongoose';

const ExecutionLogSchema = new mongoose.Schema({
  nodeKey: String,
  nodeType: String,
  status: { type: String, enum: ['entered', 'completed', 'failed', 'waiting', 'skipped'], default: 'entered' },
  message: String,
  at: { type: Date, default: Date.now },
  durationMs: Number,
  meta: mongoose.Schema.Types.Mixed,
}, { _id: false });

const FlowExecutionSchema = new mongoose.Schema({
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
  flowVersion: { type: Number, default: 1 },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  phone: { type: String, trim: true, index: true },
  status: {
    type: String,
    enum: ['active', 'waiting', 'completed', 'failed', 'cancelled', 'test'],
    default: 'active',
    index: true,
  },
  currentNodeKey: { type: String, default: null },
  /** Waiting for reply / delay */
  wait: {
    type: { type: String, enum: ['reply', 'delay', null], default: null },
    until: Date,
    expectedButtons: [String],
    saveAs: String,
    nodeKey: String,
  },
  variables: { type: mongoose.Schema.Types.Mixed, default: {} },
  logs: [ExecutionLogSchema],
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  lastActivityAt: { type: Date, default: Date.now },
  isTest: { type: Boolean, default: false },
  error: String,
}, { timestamps: true });

FlowExecutionSchema.index({ businessId: 1, status: 1 });
FlowExecutionSchema.index({ businessId: 1, flowId: 1, status: 1 });
FlowExecutionSchema.index({ leadId: 1, status: 1 });
FlowExecutionSchema.index({ 'wait.until': 1, status: 1 });

export default mongoose.models.FlowExecution || mongoose.model('FlowExecution', FlowExecutionSchema);
