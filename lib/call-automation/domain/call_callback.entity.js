import mongoose from 'mongoose';

const CallCallbackSchema = new mongoose.Schema({
  missedCallId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CallMissed',
    required: true,
    unique: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  extractedName: {
    type: String,
    trim: true
  },
  extractedIntent: {
    type: String,
    trim: true
  },
  preferredCallbackTime: {
    type: String,
    trim: true
  },
  outcome: {
    type: String,
    enum: ['answered', 'no_answer', 'failed'],
    default: 'no_answer'
  },
  conversationLog: [{
    role: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.models.CallCallback || mongoose.model('CallCallback', CallCallbackSchema);
