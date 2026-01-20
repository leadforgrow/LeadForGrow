import mongoose from 'mongoose';

/**
 * Client Model
 * 
 * Each client is a separate document (NOT embedded in Agency).
 * Represents a client managed by an agency.
 * 
 * ISOLATION: Completely separate collection, linked only by agencyId.
 */

const ClientSchema = new mongoose.Schema({
  // Agency Relationship
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
    index: true
  },
  
  // Client Identity
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Client Business Information
  industry: {
    type: String,
    trim: true
  },
  
  website: {
    type: String,
    trim: true
  },
  
  // Contact Information
  primaryContact: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['active', 'paused', 'churned'],
    default: 'active',
    index: true
  },
  
  // Timestamps for Status Changes
  activatedAt: {
    type: Date,
    default: Date.now
  },
  
  pausedAt: {
    type: Date
  },
  
  churnedAt: {
    type: Date
  },
  
  // Team Assignment (References to User IDs)
  assignedTeam: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Notes & Context
  notes: {
    type: String,
    trim: true
  },
  
  // Billion Dollar SaaS Features: Billing & Health
  billing: {
    retainerAmount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'manual'],
      default: 'manual'
    },
    autoGenerateInvoice: {
      type: Boolean,
      default: false
    },
    nextBillingDate: {
      type: Date
    }
  },

  healthScore: {
    status: {
      type: String,
      enum: ['healthy', 'at-risk', 'unhealthy'],
      default: 'healthy'
    },
    lastLeadAt: Date,
    leadVelocity: {
      type: Number, // Leads in last 30 days
      default: 0
    },
    riskFactors: [String]
  },

  // Lead Assignment Logic
  leadAssignment: {
    mode: {
      type: String,
      enum: ['manual', 'round-robin'],
      default: 'manual'
    },
    lastAssignedIndex: {
      type: Number,
      default: 0 // For round-robin tracking
    }
  },

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound Indexes for Performance
ClientSchema.index({ agencyId: 1, status: 1 });
ClientSchema.index({ agencyId: 1, createdAt: -1 });

// Methods
ClientSchema.methods.isActive = function() {
  return this.status === 'active';
};

ClientSchema.methods.pause = function() {
  this.status = 'paused';
  this.pausedAt = new Date();
};

ClientSchema.methods.activate = function() {
  this.status = 'active';
  this.activatedAt = new Date();
  this.pausedAt = null;
};

ClientSchema.methods.churn = function() {
  this.status = 'churned';
  this.churnedAt = new Date();
};

export default mongoose.models.Client || mongoose.model('Client', ClientSchema);
