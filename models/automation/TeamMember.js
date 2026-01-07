import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  // Business Context (Multi-tenant)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['owner', 'admin', 'team_member'],
    default: 'team_member'
  },
  
  permissions: {
    viewAllLeads: {
      type: Boolean,
      default: false
    },
    manageAllLeads: {
      type: Boolean,
      default: false
    },
    manageAutomation: {
      type: Boolean,
      default: false
    },
    manageTeam: {
      type: Boolean,
      default: false
    },
    viewReports: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  active: {
    type: Boolean,
    default: true
  },
  
  // Performance Metrics
  metrics: {
    totalLeadsHandled: {
      type: Number,
      default: 0
    },
    leadsConverted: {
      type: Number,
      default: 0
    },
    averageResponseTimeMinutes: {
      type: Number,
      default: 0
    },
    lastActivityAt: {
      type: Date
    }
  },
  
  // Assignment Settings
  autoAssign: {
    type: Boolean,
    default: true
  },
  maxConcurrentLeads: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

// Indexes
TeamMemberSchema.index({ businessId: 1, active: 1 });
TeamMemberSchema.index({ userId: 1 });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);

