import mongoose from 'mongoose';

const WorkflowNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const WorkflowEdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: { type: String, default: 'default' },
  targetHandle: { type: String, default: 'default' },
  label: { type: String, default: '' },
}, { _id: false });

const SequenceStepSchema = new mongoose.Schema({
  delayDays: { type: Number, default: 0 },
  channel: { type: String, enum: ['whatsapp', 'email', 'both'], default: 'both' },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutomationRule' },
  emailSubject: { type: String, trim: true },
  messageTemplate: { type: String, trim: true },
}, { _id: true });

const AutomationSequenceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['nurture', 'recovery', 'qualification', 'reactivation', 'booking', 'custom'],
    default: 'custom',
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft',
    index: true,
  },
  triggerType: {
    type: String,
    enum: [
      'new_lead', 'form_submission', 'whatsapp_message', 'meta_lead',
      'stage_changed', 'missed_call', 'tag_added', 'no_reply', 'payment_received',
      'event_joined',
    ],
    default: 'new_lead',
  },
  triggerConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  workflowMode: { type: String, enum: ['graph', 'linear'], default: 'graph' },
  nodes: [WorkflowNodeSchema],
  edges: [WorkflowEdgeSchema],
  steps: [SequenceStepSchema],
  active: { type: Boolean, default: true },
  automationRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationRule',
    index: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 },
  tags: [{ type: String, trim: true }],
  analytics: {
    enrolled: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    responded: { type: Number, default: 0 },
    activeRuns: { type: Number, default: 0 },
  },
}, { timestamps: true });

AutomationSequenceSchema.index({ businessId: 1, status: 1 });

export default mongoose.models.AutomationSequence
  || mongoose.model('AutomationSequence', AutomationSequenceSchema);
