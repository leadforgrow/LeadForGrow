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
    enum: ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contacts', 'button', 'interactive'],
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
    enum: ['sent', 'delivered', 'read', 'failed', 'received'],
    default: 'received'
  },
  rawMetadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for conversation lookup
MessageSchema.index({ businessId: 1, leadId: 1, timestamp: -1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
