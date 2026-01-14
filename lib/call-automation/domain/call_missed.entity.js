import mongoose from 'mongoose';

const CallMissedSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  callerNumber: {
    type: String,
    required: true,
    trim: true
  },
  businessNumber: {
    type: String,
    required: false, // Optional for older records, but should be filled for new ones
    trim: true,
    index: true
  },
  callTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['missed', 'processing', 'completed', 'failed'],
    default: 'missed'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

CallMissedSchema.index({ businessId: 1, status: 1 });
CallMissedSchema.index({ businessId: 1, callTime: -1 });

export default mongoose.models.CallMissed || mongoose.model('CallMissed', CallMissedSchema);
