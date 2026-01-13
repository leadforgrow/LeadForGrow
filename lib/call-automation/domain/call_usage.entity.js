import mongoose from 'mongoose';

const CallUsageSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  month: {
    type: String, // Format: YYYY-MM
    required: true,
    index: true
  },
  connectedPhone: {
    type: String,
    trim: true
  },
  callbacksUsed: {
    type: Number,
    default: 0
  },
  secondsUsed: {
    type: Number,
    default: 0
  },
  limitReached: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one usage record per business per month
CallUsageSchema.index({ businessId: 1, month: 1 }, { unique: true });

export default mongoose.models.CallUsage || mongoose.model('CallUsage', CallUsageSchema);
