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
      'whatsapp_received'
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

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

