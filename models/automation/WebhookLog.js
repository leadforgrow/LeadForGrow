import mongoose from 'mongoose';

const WebhookLogSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['meta', 'interakt'],
    default: 'meta'
  },
  webhookId: {
    type: String, // WhatsApp message ID or unique event ID
    unique: true,
    required: true,
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-delete logs after 7 days to save space
WebhookLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.models.WebhookLog || mongoose.model('WebhookLog', WebhookLogSchema);
