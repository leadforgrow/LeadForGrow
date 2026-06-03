import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  // Business Context (Multi-tenant)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Related Lead
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },

  // Activity Type
  type: {
    type: String,
    enum: [
      'lead_created',
      'status_changed',
      'note_added',
      'contacted_call',
      'contacted_whatsapp',
      'contacted_email',
      'follow_up_scheduled',
      'follow_up_completed',
      'task_created',
      'automation_executed',
      'assigned',
      'converted',
      'lost',
      're-engagement',
      'whatsapp_received',
      'meeting_booked',
      'meeting_completed',
      'meeting_no_show',
      'meeting_cancelled'
    ],
    required: true
  },

  // Activity Details
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Additional Data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Performed By
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Timestamp
  performedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes
ActivitySchema.index({ leadId: 1, performedAt: -1 });
ActivitySchema.index({ businessId: 1, performedAt: -1 });

// Force recompilation in dev so enum updates apply (prevents stale schema cache)
if (mongoose.models.Activity) {
  delete mongoose.models.Activity;
}

export default mongoose.model('Activity', ActivitySchema);

