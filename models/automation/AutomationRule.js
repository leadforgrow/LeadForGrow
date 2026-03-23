import mongoose from 'mongoose';

const AutomationRuleSchema = new mongoose.Schema({
  // Business Context (Multi-tenant)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Rule Identification
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Rule Type
  type: {
    type: String,
    enum: [
      'instant_acknowledgement',
      'notify_team',
      'auto_assign',
      'follow_up_reminder',
      'lost_lead_reengagement',
      'manual_template'
    ],
    required: true
  },

  // Status
  enabled: {
    type: Boolean,
    default: true
  },

  // Configuration
  config: {
    // For instant acknowledgement
    messageTemplate: {
      type: String,
      trim: true
    },
    whatsappTemplate: {
      type: String,
      trim: true
    },
    whatsappTemplateName: {
      type: String,
      trim: true
    },
    whatsappHeaderMedia: {
      type: String,
      trim: true
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'email', 'both']
    },
    emailSubject: {
      type: String,
      trim: true
    },

    // For auto-assign
    assignmentRule: {
      type: String,
      enum: ['round-robin', 'least-busy', 'specific-member']
    },
    assignToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // For follow-up reminders
    delayHours: {
      type: Number
    },

    // For notifications
    notifyUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Trigger Conditions
  triggers: {
    onLeadReceived: {
      type: Boolean,
      default: false
    },
    onStatusChange: {
      type: Boolean,
      default: false
    },
    onNoResponse: {
      type: Boolean,
      default: false
    }
  },

  // Analytics
  executionCount: {
    type: Number,
    default: 0
  },
  lastExecutedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
AutomationRuleSchema.index({ businessId: 1, enabled: 1 });
AutomationRuleSchema.index({ type: 1 });

// Force recompilation of model if it exists (prevents stale schema in dev)
if (mongoose.models.AutomationRule) {
  delete mongoose.models.AutomationRule;
}

export default mongoose.model('AutomationRule', AutomationRuleSchema);

