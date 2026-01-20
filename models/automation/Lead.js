import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  // Business Context (Optional - for solo businesses)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false,
    index: true
  },
  
  // Agency Context (Optional - for agency users only)
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    index: true
  },
  
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    index: true
  },
  
  // Customer Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  
  // Lead Information
  source: {
    type: String,
    enum: ['website', 'form', 'whatsapp', 'webhook', 'referral', 'ad', 'call', 'manual', 'bulk', 'other'],
    default: 'website'
  },
  sourceDetails: {
    type: String,
    trim: true
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  },
  sourcePage: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  serviceInterest: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  
  // Status & Assignment
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'follow-up', 'converted', 'lost'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Timestamps
  receivedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: {
    type: Date
  },
  nextFollowUpAt: {
    type: Date
  },
  convertedAt: {
    type: Date
  },
  lostAt: {
    type: Date
  },
  
  // Internal Notes
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  archived: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance and deduplication
// Note: Deduplication is handled in leadProcessor.js, not via unique constraint
LeadSchema.index({ businessId: 1, phone: 1 }); // Non-unique for query performance
LeadSchema.index({ businessId: 1, status: 1 });
LeadSchema.index({ businessId: 1, receivedAt: -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ nextFollowUpAt: 1 });
LeadSchema.index({ formId: 1 });

// Agency-specific indexes (for agency users)
LeadSchema.index({ agencyId: 1, clientId: 1 });
LeadSchema.index({ agencyId: 1, status: 1 });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

