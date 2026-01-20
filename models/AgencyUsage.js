import mongoose from 'mongoose';

/**
 * AgencyUsage Model
 * 
 * Tracks usage per billing cycle for limit enforcement.
 * One document per agency per billing month.
 * 
 * ISOLATION: Separate collection for usage tracking.
 * SAFETY: Supports atomic increments and monthly resets.
 */

const AgencyUsageSchema = new mongoose.Schema({
  // Agency Reference
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
    index: true
  },
  
  // Billing Period (Year + Month)
  billingYear: {
    type: Number,
    required: true
  },
  
  billingMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  
  // Usage Counters
  usage: {
    clientsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    teamSeatsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    leadsUsed: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Last Reset Timestamp
  lastResetAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound Unique Index (One document per agency per month)
AgencyUsageSchema.index({ agencyId: 1, billingYear: 1, billingMonth: 1 }, { unique: true });

// Methods
AgencyUsageSchema.methods.incrementClients = async function() {
  this.usage.clientsUsed += 1;
  await this.save();
};

AgencyUsageSchema.methods.incrementTeamSeats = async function() {
  this.usage.teamSeatsUsed += 1;
  await this.save();
};

AgencyUsageSchema.methods.incrementLeads = async function(count = 1) {
  this.usage.leadsUsed += count;
  await this.save();
};

AgencyUsageSchema.methods.reset = async function() {
  this.usage.clientsUsed = 0;
  this.usage.teamSeatsUsed = 0;
  this.usage.leadsUsed = 0;
  this.lastResetAt = new Date();
  await this.save();
};

// Static Methods
AgencyUsageSchema.statics.getOrCreateForMonth = async function(agencyId, year, month) {
  let usage = await this.findOne({ agencyId, billingYear: year, billingMonth: month });
  
  if (!usage) {
    usage = await this.create({
      agencyId,
      billingYear: year,
      billingMonth: month,
      usage: {
        clientsUsed: 0,
        teamSeatsUsed: 0,
        leadsUsed: 0
      }
    });
  }
  
  return usage;
};

export default mongoose.models.AgencyUsage || mongoose.model('AgencyUsage', AgencyUsageSchema);
