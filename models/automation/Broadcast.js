import mongoose from 'mongoose';

const BroadcastRecipientSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  email: String,
  phone: String,
  name: String,
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed', 'skipped', 'opted_out'],
    default: 'pending',
  },
  error: String,
  // Meta returns a message id (wamid) after a successful send. We store it so
  // the incoming delivery-status webhook can flip this recipient to
  // delivered/read/failed with the real reason.
  metaMessageId: { type: String, index: true },
  failureCode: String,
  failureTitle: String,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  failedAt: Date,
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
    whatsappTemplateLanguage: String,
    // Public URL to media used in the template's header at send time.
    // Required when the selected template has an IMAGE/VIDEO/DOCUMENT header.
    whatsappHeaderMediaUrl: String,
    // Meta template variables — each {{n}} in body gets resolved from these.
    // source: 'lead.name' | 'lead.email' | 'lead.phone' | 'lead.city' | 'literal'
    variableMapping: [
      new mongoose.Schema({
        index: { type: Number, required: true },
        source: { type: String, required: true },
        literalValue: String,
      }, { _id: false }),
    ],
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
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    optedOut: { type: Number, default: 0 },
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
