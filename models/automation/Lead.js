import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';
import { LEAD_PIPELINE_STAGE_KEYS } from '@/lib/crm/leadStages';

const LEGACY_LEAD_STATUSES = ['new', 'contacted', 'interested', 'follow-up'];

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
    enum: ['website', 'form', 'whatsapp', 'webhook', 'referral', 'ad', 'call', 'manual', 'bulk', 'bot', 'instagram_ad', 'facebook_ad', 'meta_ads', 'other'],
    default: 'website'
  },
  sourceDetails: {
    type: String,
    trim: true
  },
  
  // WhatsApp & Lead Ads Attribution
  adId: { type: String },
  metaLeadId: { type: String, index: true }, // The unique ID from Meta Lead Ads
  campaignName: { type: String },
  adSetName: { type: String },
  adName: { type: String },
  adHeadline: { type: String },
  adSourceType: { type: String }, // 'ad', 'post', or 'lead_gen'
  referralData: { type: mongoose.Schema.Types.Mixed },
  
  formId: {
    type: String // Can be Form model ID or Meta Form ID
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
    enum: [...LEAD_PIPELINE_STAGE_KEYS, 'converted', ...LEGACY_LEAD_STATUSES],
    default: 'new_lead'
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
  rowColor: {
    type: String,
    trim: true,
    default: null
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

  // CRM relationships
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  tags: [{ type: String, trim: true }],
  customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

  // Metadata
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
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

LeadSchema.plugin(baseSchemaPlugin);

// Indexes for performance and deduplication
LeadSchema.index({ businessId: 1, phone: 1 }); 
LeadSchema.index({ businessId: 1, whatsappId: 1 }, { unique: true, sparse: true }); // HARDENED: Unique index to prevent duplicates
LeadSchema.index({ businessId: 1, status: 1 });
LeadSchema.index({ businessId: 1, receivedAt: -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ nextFollowUpAt: 1 });
LeadSchema.index({ formId: 1 });
LeadSchema.index({ adId: 1 });
LeadSchema.index({ businessId: 1, metaLeadId: 1 }, { unique: true, sparse: true }); // Prevent duplicate Meta Leads

// Agency-specific indexes (for agency users)
LeadSchema.index({ agencyId: 1, clientId: 1 });
LeadSchema.index({ agencyId: 1, status: 1 });
LeadSchema.index({ businessId: 1, email: 1 });
LeadSchema.index({ businessId: 1, tags: 1 });
LeadSchema.index({ businessId: 1, archived: 1, updatedAt: -1 });
LeadSchema.index({ businessId: 1, companyId: 1 });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

