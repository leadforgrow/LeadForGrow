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
  whatsappId: {
    type: String, // The sender's Meta WA ID (phone number based)
    trim: true,
    index: true
  },

  // Lead Information
  source: {
    type: String,
    enum: ['website', 'form', 'whatsapp', 'webhook', 'referral', 'ad', 'call', 'manual', 'bulk', 'bot', 'instagram_ad', 'facebook_ad', 'other'],
    default: 'website'
  },
  sourceDetails: {
    type: String,
    trim: true
  },
  
  // WhatsApp Ad Attribution
  adId: { type: String },
  campaignName: { type: String },
  adHeadline: { type: String },
  adSourceType: { type: String }, // 'ad' or 'post'
  referralData: { type: mongoose.Schema.Types.Mixed },
  
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
  },

  // Event & Sequence Tracking
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    index: true
  },
  activeSequenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationSequence'
  },
  sequenceStepIndex: {
    type: Number,
    default: 0
  },
  isRead: {
    type: Boolean,
    default: false
  },
  historyVisibleFrom: {
    type: Date, // If set, messages before this date are hidden from the current assignee
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance and deduplication
LeadSchema.index({ businessId: 1, phone: 1 }); 
LeadSchema.index({ businessId: 1, whatsappId: 1 }, { unique: true }); // HARDENED: Unique index to prevent duplicates
LeadSchema.index({ businessId: 1, status: 1 });
LeadSchema.index({ businessId: 1, receivedAt: -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ nextFollowUpAt: 1 });
LeadSchema.index({ formId: 1 });
LeadSchema.index({ adId: 1 });

// Agency-specific indexes (for agency users)
LeadSchema.index({ agencyId: 1, clientId: 1 });
LeadSchema.index({ agencyId: 1, status: 1 });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

