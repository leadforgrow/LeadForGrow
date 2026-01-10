import mongoose from 'mongoose';

const OnboardingCallSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPhone: {
    type: String,
    default: null,
  },
  meetLink: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled_pre_payment', 'attended', 'missed', 'converted'],
    default: 'scheduled_pre_payment',
  },
  attended: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
  planId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
OnboardingCallSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

export default mongoose.models.OnboardingCall || mongoose.model('OnboardingCall', OnboardingCallSchema);
