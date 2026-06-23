import mongoose from 'mongoose';

const BroadcastRecipientSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  email: String,
  phone: String,
  name: String,
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'skipped'],
    default: 'pending',
  },
  error: String,
  sentAt: Date,
}, { _id: false });

const BroadcastSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  channel: {
    type: String,
    enum: ['whatsapp', 'email', 'both'],
    default: 'whatsapp',
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft',
    index: true,
  },
  audience: {
    type: { type: String, enum: ['all', 'filter', 'tags', 'manual'], default: 'filter' },
    filters: mongoose.Schema.Types.Mixed,
    tags: [String],
    leadIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
  },
  content: {
    subject: String,
    body: String,
    whatsappTemplate: String,
    whatsappTemplateName: String,
  },
  scheduledAt: Date,
  sentAt: Date,
  completedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipients: [BroadcastRecipientSchema],
  analytics: {
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
  },
  testMode: { type: Boolean, default: false },
  testRecipients: [{ email: String, phone: String, name: String }],
}, { timestamps: true });

BroadcastSchema.index({ businessId: 1, status: 1 });
BroadcastSchema.index({ businessId: 1, scheduledAt: 1 });

export default mongoose.models.Broadcast
  || mongoose.model('Broadcast', BroadcastSchema);
