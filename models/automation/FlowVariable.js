import mongoose from 'mongoose';

/**
 * Per-business reusable flow variables (defaults + labels).
 * Runtime values live on FlowExecution.variables.
 */
const FlowVariableSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  flowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppFlow',
    default: null,
    index: true,
  },
  key: { type: String, required: true, trim: true },
  label: { type: String, trim: true, default: '' },
  defaultValue: { type: String, default: '' },
  source: {
    type: String,
    enum: ['system', 'custom', 'reply'],
    default: 'custom',
  },
}, { timestamps: true });

FlowVariableSchema.index({ businessId: 1, flowId: 1, key: 1 }, { unique: true });

export default mongoose.models.FlowVariable || mongoose.model('FlowVariable', FlowVariableSchema);
