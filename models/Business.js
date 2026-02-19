import mongoose from 'mongoose';
import crypto from 'crypto';

// Revenue Intelligence Configuration Schema
const RevenueConfigSchema = new mongoose.Schema({
  // Average Deal Values
  avgDealValue: {
    min: { type: Number },
    typical: { type: Number, required: true },
    high: { type: Number },
    currency: { type: String, default: 'INR' }
  },

  // Service-wise Deal Values (Optional)
  serviceValues: [{
    name: { type: String, required: true },
    value: { type: Number, required: true },
    _id: false
  }],

  // SLA Settings
  sla: {
    firstResponseMinutes: { type: Number, default: 15 },
    followupMinutes: { type: Number, default: 60 }
  },

  // Working Hours
  workingHours: {
    days: { type: [Number], default: [1, 2, 3, 4, 5, 6] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },

  // Conversion Rates
  conversionRate: {
    low: { type: Number, default: 5 },
    avg: { type: Number, default: 10 },
    high: { type: Number, default: 20 }
  },

  // Lead Source Weighting
  sources: [{
    name: { type: String, required: true },
    weight: { type: Number, min: 0, max: 1, default: 0.5 },
    avgConversion: { type: Number, min: 0, max: 100, default: 0 },
    _id: false
  }],

  // Follow-up Strategy
  followup: {
    maxAttempts: { type: Number, default: 5 },
    gapMinutes: { type: Number, default: 1440 }
  },

  // Preferred Contact Channels
  preferredChannels: {
    type: [String],
    enum: ['call', 'whatsapp', 'email'],
    default: ['call', 'whatsapp']
  },

  // Team Roles (for future use)
  teamRoles: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    experienceLevel: { type: String },
    _id: false
  }],

  // Legal Acknowledgment
  estimationAcknowledged: { type: Boolean, default: false },

  // Timestamps
  configuredAt: { type: Date },
  lastUpdatedAt: { type: Date }
}, { _id: false });

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
      recipients: [{ type: String }]
    },
    whatsapp: {
      enabled: { type: Boolean, default: false },
      recipients: [{ type: String }]
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
      type: [Number],
      default: [1, 2, 3, 4, 5, 6]
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
  },

  // Call Automation Settings
  callAutomation: {
    enabled: { type: Boolean, default: true },
    voiceId: { type: String, default: 'en-US-Neural2-F' },
    recordCalls: { type: Boolean, default: false },
    maxDurationSeconds: { type: Number, default: 60 },
    greetingMessage: { type: String, default: 'Hello, I am the AI assistant for {{businessName}}.' },
    enableSmsFollowup: { type: Boolean, default: true },

    telephony: {
      provider: { type: String, enum: ['vapi', 'retell', 'twilio'], default: 'vapi' },
      apiKey: { type: String, select: false },
      assistantId: { type: String },
      phoneNumberId: { type: String }
    }
  }
}, { _id: false });

const IntegrationCredentialsSchema = new mongoose.Schema({
  whatsapp: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['meta', 'interakt'], default: 'meta' },
    apiKey: { type: String }, // Used as Access Token for Meta
    interaktApiKey: { type: String },
    phoneNumberId: { type: String },
    businessAccountId: { type: String },
    appSecret: { type: String },
    verifyToken: { type: String },
    lastVerified: { type: Date }
  },

  email: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['smtp', 'sendgrid', 'mailgun', 'ses'] },
    host: { type: String },
    port: { type: Number },
    username: { type: String },
    password: { type: String },
    fromEmail: { type: String },
    fromName: { type: String },
    lastVerified: { type: Date }
  },

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
    type: String
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
    enum: ['free', 'trial', 'growth', 'enterprise', 'agency starter', 'agency growth', 'agency pro'],
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
    maxForms: { type: Number, default: 1 },
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

  // Revenue Intelligence Configuration
  revenueConfig: {
    type: RevenueConfigSchema,
    default: null
  },

  // Revenue Intelligence Active Flag
  revenueIntelligenceActive: {
    type: Boolean,
    default: false
  },

  // Integration Credentials (encrypted)
  integrationCredentials: {
    type: IntegrationCredentialsSchema,
    default: () => ({})
  },

  // Integration Health & Status Tracking
  integrationHealth: {
    email: {
      status: { type: String, enum: ['healthy', 'degraded', 'failing', 'unknown'], default: 'unknown' },
      lastSuccessAt: Date,
      lastError: String
    },
    whatsapp: {
      status: { type: String, enum: ['healthy', 'degraded', 'failing', 'unknown'], default: 'unknown' },
      lastSuccessAt: Date,
      lastError: String
    },
    webhooks: {
      status: { type: String, enum: ['active', 'error', 'inactive'], default: 'inactive' },
      lastSuccessAt: Date,
      lastError: String,
      totalCount: { type: Number, default: 0 }
    }
  },

  // API & Webhook Security
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  webhookSecret: {
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

// Indexes
BusinessSchema.index({ ownerId: 1 });
BusinessSchema.index({ status: 1 });
BusinessSchema.index({ plan: 1 });

// Methods
BusinessSchema.methods.generateApiKey = function () {
  this.apiKey = 'lfg_biz_' + crypto.randomBytes(32).toString('hex');
  return this.apiKey;
};

BusinessSchema.methods.generateWebhookSecret = function () {
  this.webhookSecret = 'wh_sec_' + crypto.randomBytes(32).toString('hex');
  return this.webhookSecret;
};

BusinessSchema.methods.canCreateForm = function () {
  if (this.plan === 'enterprise') return true;
  return this.usage.formsCreated < this.quotas.maxForms;
};

BusinessSchema.methods.canCreateAutomationRule = function () {
  return true;
};

BusinessSchema.methods.incrementLeadCount = function () {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);

  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.leadsThisMonth = 0;
    this.usage.lastResetDate = now;
  }

  this.usage.leadsThisMonth += 1;
};

BusinessSchema.methods.hasReachedLeadLimit = function () {
  if (this.plan === 'enterprise') return false;
  return this.usage.leadsThisMonth >= this.quotas.maxLeadsPerMonth;
};

// Revenue Intelligence Helper Methods
BusinessSchema.methods.calculateLeadValue = function (leadSource) {
  if (!this.revenueConfig || !this.revenueIntelligenceActive) {
    return this.revenueConfig?.avgDealValue?.typical || 0;
  }

  // Find source weight
  const source = this.revenueConfig.sources.find(s =>
    s.name.toLowerCase() === leadSource?.toLowerCase()
  );

  const sourceWeight = source ? source.weight : 0.5;
  const baseValue = this.revenueConfig.avgDealValue.typical;

  return baseValue * sourceWeight;
};

BusinessSchema.methods.isWithinWorkingHours = function (timestamp) {
  if (!this.revenueConfig) return true;

  const date = new Date(timestamp);
  const day = date.getDay();
  const time = date.toTimeString().slice(0, 5); // HH:MM format

  const workingDays = this.revenueConfig.workingHours.days;
  const startTime = this.revenueConfig.workingHours.startTime;
  const endTime = this.revenueConfig.workingHours.endTime;

  if (!workingDays.includes(day)) return false;
  if (time < startTime || time > endTime) return false;

  return true;
};

BusinessSchema.methods.getEstimatedConversionRate = function (leadSource) {
  if (!this.revenueConfig) {
    return this.revenueConfig?.conversionRate?.avg || 10;
  }

  const source = this.revenueConfig.sources.find(s =>
    s.name.toLowerCase() === leadSource?.toLowerCase()
  );

  return source?.avgConversion || this.revenueConfig.conversionRate.avg;
};

// Update quotas based on plan
BusinessSchema.pre('save', async function () {
  if (this.isModified('plan')) {
    switch (this.plan) {
      case 'free':
        this.quotas.maxForms = 1;
        this.quotas.maxTeamMembers = 1;
        this.quotas.maxAutomationRules = 3;
        this.quotas.maxLeadsPerMonth = 100;
        break;
      case 'trial':
        this.quotas.maxForms = 1;
        this.quotas.maxTeamMembers = 2;
        this.quotas.maxAutomationRules = 5;
        this.quotas.maxLeadsPerMonth = 200;
        break;
      case 'growth':
        this.quotas.maxForms = 10;
        this.quotas.maxTeamMembers = 10;
        this.quotas.maxAutomationRules = 20;
        this.quotas.maxLeadsPerMonth = 1000;
        break;
      case 'enterprise':
      case 'agency starter':
      case 'agency growth':
      case 'agency pro':
        this.quotas.maxForms = 999999;
        this.quotas.maxTeamMembers = 999999;
        this.quotas.maxAutomationRules = 999999;
        this.quotas.maxLeadsPerMonth = 999999;
        break;
    }
  }
});

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);