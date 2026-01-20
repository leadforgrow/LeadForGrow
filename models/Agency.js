import mongoose from 'mongoose';

/**
 * Agency Model
 * 
 * Represents an agency account with plan-based limits.
 * Detection: Any user whose plan contains "agency" is treated as agency.
 * 
 * ISOLATION: This collection is completely separate from Business/User.
 */

const AgencySchema = new mongoose.Schema({
  // Identity
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  
  agencyName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Plan Information (Dynamic Detection)
  planName: {
    type: String,
    required: true,
    trim: true,
    // Examples: "Agency Starter", "Agency Growth", "Agency Pro"
    // Detection logic will check if this contains "agency"
  },
  
  // Plan Limits (Stored, Never Inferred)
  limits: {
    maxClients: {
      type: Number,
      required: true,
      default: 5
    },
    maxTeamSeats: {
      type: Number,
      required: true,
      default: 5
    },
    maxLeadsPerMonth: {
      type: Number,
      required: true,
      default: 1000
    }
  },
  
  // Billing Cycle Tracking
  billingCycleStart: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  
  // Contact Information
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  contactPhone: {
    type: String,
    trim: true
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for Performance
AgencySchema.index({ ownerId: 1 });
AgencySchema.index({ status: 1 });
AgencySchema.index({ planName: 1 });
AgencySchema.index({ billingCycleStart: 1 });

// Methods
AgencySchema.methods.isActive = function() {
  return this.status === 'active';
};

AgencySchema.methods.getCurrentBillingMonth = function() {
  const now = new Date();
  const cycleStart = new Date(this.billingCycleStart);
  
  // Calculate months since cycle start
  const monthsDiff = (now.getFullYear() - cycleStart.getFullYear()) * 12 + 
                     (now.getMonth() - cycleStart.getMonth());
  
  return {
    year: cycleStart.getFullYear() + Math.floor((cycleStart.getMonth() + monthsDiff) / 12),
    month: (cycleStart.getMonth() + monthsDiff) % 12 + 1
  };
};

export default mongoose.models.Agency || mongoose.model('Agency', AgencySchema);
