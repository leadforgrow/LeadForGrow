import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    index: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'instagram', 'email'],
    default: 'whatsapp',
    index: true
  },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  isInternal: { type: Boolean, default: false },
  starred: { type: Boolean, default: false },
  replyToMessageId: String,

  // Which mailbox sent or received this message. Populated for channel='email'.
  // Nullable so pre-multi-user rows keep loading; new writes populate it.
  emailAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailAccount',
    index: true,
  },
  emailThreadId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailThread' },
  subject: String,

  // RFC 2822 threading headers. `inReplyTo` is the parent's Message-ID; used
  // by the IMAP sync worker to fold an inbound reply into the correct thread.
  // Sparse index — most rows (WhatsApp, Instagram) leave it null.
  inReplyTo: { type: String, trim: true, index: { sparse: true } },
  references: [{ type: String, trim: true }],

  // Extra headers we may want later (List-Unsubscribe, X-Provider-*, etc.).
  // Stored as a Map so we don't have to touch the schema every time we add
  // one; kept optional to keep row size sane on non-email channels.
  headers: { type: Map, of: String },

  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contacts', 'button', 'interactive', 'email', 'story_reply'],
    default: 'text'
  },
  content: {
    body: String,
    caption: String,
    fileName: String,
    mimeType: String,
    sha256: String,
    mediaId: String, // Meta's media ID
    mediaUrl: String  // If already resolved
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'received', 'draft', 'scheduled'],
    default: 'received'
  },
  folder: { type: String, enum: ['inbox', 'sent', 'drafts', 'trash', 'starred'], index: true },

  // Provenance — who/what caused this message to be sent. Used by the inbox
  // filter chip so agents can toggle between "human conversation" view and
  // "everything including automated sends." Nullable-ish (default 'user') so
  // pre-existing rows don't need a backfill to load; a one-line updateMany
  // covers old data if we ever want strict enum enforcement.
  origin: {
    type: String,
    enum: ['user', 'automation', 'sequence', 'broadcast', 'meeting', 'system'],
    default: 'user',
    index: true,
  },

  scheduledAt: Date,
  isDeleted: { type: Boolean, default: false },
  rawMetadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for conversation lookup
MessageSchema.index({ businessId: 1, leadId: 1, timestamp: -1 });
MessageSchema.index({ businessId: 1, conversationId: 1, timestamp: -1 });
MessageSchema.index({ businessId: 1, channel: 1, timestamp: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
