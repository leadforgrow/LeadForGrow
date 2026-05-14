import mongoose from 'mongoose';

const WhatsAppConversationSchema = new mongoose.Schema({
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'intervened'],
    default: 'unread'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessagePreview: {
    type: String,
    trim: true
  },
  lastMessageDirection: {
    type: String,
    enum: ['incoming', 'outgoing']
  },
  isArchived: {
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

// Compound index for efficient list fetching
WhatsAppConversationSchema.index({ businessId: 1, status: 1, lastMessageAt: -1 });
WhatsAppConversationSchema.index({ businessId: 1, lastMessageAt: -1 });

export default mongoose.models.WhatsAppConversation || mongoose.model('WhatsAppConversation', WhatsAppConversationSchema);
