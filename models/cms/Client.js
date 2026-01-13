import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    unique: true,
    default: () => `CL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  clientType: {
    type: String,
    enum: ['Retainer', 'One-time'],
    default: 'Retainer'
  },
  industry: String,
  primaryContact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  contractValue: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  billingCycle: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'One-time'],
    default: 'Monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  accountManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'On Hold', 'Completed', 'Churned'],
    default: 'Active'
  },
  internalNotes: String,
  tags: [String],
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  collection: 'cms_clients'
});

// Indexes for high performance
ClientSchema.index({ companyName: 'text', 'primaryContact.email': 'text' });
ClientSchema.index({ status: 1 });

export default mongoose.models.CMS_Client || mongoose.model('CMS_Client', ClientSchema);
