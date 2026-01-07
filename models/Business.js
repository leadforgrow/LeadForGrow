import mongoose from 'mongoose';
import crypto from 'crypto';

const BusinessSettingsSchema = new mongoose.Schema({
  // Lead Assignment Strategy
  assignmentStrategy: {
    type: String,
    enum: ['solo', 'round-robin', 'least-busy'],
    default: 'solo'
  },
  
  // Notification Preferences
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String }] // Email addresses
    },
    whatsapp: {
      enabled: { type: Boolean, default: false },
      recipients: [{ type: String }] // Phone numbers
    },
    slack: {
      enabled: { type: Boolean, default: false },
      webhookUrl: { type: String }
    }
  },
  
  // Business Hours
  businessHours: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    workingDays: {
      type: [Number], // 0-6 (Sunday-Saturday)
      default: [1, 2, 3, 4, 5, 6] // Monday-Saturday
    },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' }
  },
  
  // Auto-response settings
  autoResponse: {
    enabled: { type: Boolean, default: true },
    messageTemplate: {
      type: String,
      default: 'Thank you {{name}} for your interest in {{serviceInterest}}. We will get back to you shortly!'
    }
  }
}, { _id: false });

const IntegrationCredentialsSchema = new mongoose.Schema({
  // WhatsApp Business API
  whatsapp: {
    enabled: { type: Boolean, default: false },
    apiKey: { type: String },
    phoneNumberId: { type: String },
    businessAccountId: { type: String },
    lastVerified: { type: Date }
  },
  
  // Email SMTP
  email: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['smtp', 'sendgrid', 'mailgun', 'ses'] },
    host: { type: String },
    port: { type: Number },
    username: { type: String },
    password: { type: String }, // Should be encrypted
    fromEmail: { type: String },
    fromName: { type: String },
    lastVerified: { type: Date }
  },
  
  // SMS (Future)
  sms: {
    enabled: { type: Boolean, default: false },
    provider: { type: String },
    apiKey: { type: String }
  }
}, { _id: false });

const BusinessSchema = new mongoose.Schema({
  // Business Identity
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String // URL to logo
  },
  
  // Ownership
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Subscription & Plan
  plan: {
    type: String,
    enum: ['free', 'growth', 'enterprise'],
    default: 'free'
  },
  planStartDate: {
    type: Date,
    default: Date.now
  },
  planEndDate: {
    type: Date
  },
  
  // Quotas (based on plan)
  quotas: {
    maxForms: { type: Number, default: 1 }, // Free: 1, Growth: 10, Enterprise: unlimited
    maxTeamMembers: { type: Number, default: 1 },
    maxAutomationRules: { type: Number, default: 3 },
    maxLeadsPerMonth: { type: Number, default: 100 }
  },
  
  // Usage Tracking
  usage: {
    formsCreated: { type: Number, default: 0 },
    leadsThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  },
  
  // Settings & Configuration
  settings: {
    type: BusinessSettingsSchema,
    default: () => ({})
  },
  
  // Integration Credentials (encrypted)
  integrationCredentials: {
    type: IntegrationCredentialsSchema,
    default: () => ({})
  },
  
  // API Key for external integrations
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Onboarding Status
  onboardingComplete: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: String,
    enum: ['business_details', 'first_form', 'integration_setup', 'automation_setup', 'completed'],
    default: 'business_details'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  
  // Billing
  billingEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes (removed duplicates - only define once here)
BusinessSchema.index({ ownerId: 1 });
BusinessSchema.index({ apiKey: 1 });
BusinessSchema.index({ status: 1 });
BusinessSchema.index({ plan: 1 });

// Methods
BusinessSchema.methods.generateApiKey = function() {
  this.apiKey = 'lfg_biz_' + crypto.randomBytes(32).toString('hex');
  return this.apiKey;
};

BusinessSchema.methods.canCreateForm = function() {
  if (this.plan === 'enterprise') return true;
  return this.usage.formsCreated < this.quotas.maxForms;
};

BusinessSchema.methods.canCreateAutomationRule = function() {
  // This will be checked against actual count in the database
  return true; // Placeholder - implement in automation rules endpoint
};

BusinessSchema.methods.incrementLeadCount = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // Reset if new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.leadsThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  this.usage.leadsThisMonth += 1;
};

BusinessSchema.methods.hasReachedLeadLimit = function() {
  if (this.plan === 'enterprise') return false;
  return this.usage.leadsThisMonth >= this.quotas.maxLeadsPerMonth;
};

// Update quotas based on plan
BusinessSchema.pre('save', async function() {
  if (this.isModified('plan')) {
    switch(this.plan) {
      case 'free':
        this.quotas.maxForms = 1;
        this.quotas.maxTeamMembers = 1;
        this.quotas.maxAutomationRules = 3;
        this.quotas.maxLeadsPerMonth = 100;
        break;
      case 'growth':
        this.quotas.maxForms = 10;
        this.quotas.maxTeamMembers = 10;
        this.quotas.maxAutomationRules = 20;
        this.quotas.maxLeadsPerMonth = 1000;
        break;
      case 'enterprise':
        this.quotas.maxForms = 999999;
        this.quotas.maxTeamMembers = 999999;
        this.quotas.maxAutomationRules = 999999;
        this.quotas.maxLeadsPerMonth = 999999;
        break;
    }
  }
});

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);

