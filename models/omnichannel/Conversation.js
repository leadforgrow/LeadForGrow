import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const AssignmentHistorySchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LabelRefSchema = new mongoose.Schema(
  {
    labelId: { type: mongoose.Schema.Types.ObjectId, ref: 'InboxLabel' },
    name: String,
    color: String,
  },
  { _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    channel: { type: String, enum: ['whatsapp', 'instagram', 'email'], required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    participantId: { type: String, trim: true, index: true },
    participantName: { type: String, trim: true },
    participantEmail: { type: String, trim: true, lowercase: true },
    participantPhone: { type: String, trim: true },
    participantAvatar: String,
    status: { type: String, enum: ['open', 'closed', 'spam', 'archived'], default: 'open', index: true },
    inboxStatus: { type: String, enum: ['unread', 'read', 'intervened'], default: 'unread', index: true },
    unreadCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessagePreview: { type: String, trim: true },
    lastMessageDirection: { type: String, enum: ['incoming', 'outgoing'] },
    labels: [LabelRefSchema],
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false, index: true },
    isSpam: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    snoozedUntil: { type: Date, index: true },
    closedAt: Date,
    emailThreadId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailThread' },
    assignmentHistory: [AssignmentHistorySchema],
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

ConversationSchema.plugin(baseSchemaPlugin);

ConversationSchema.index({ businessId: 1, channel: 1, lastMessageAt: -1 });
ConversationSchema.index({ businessId: 1, inboxStatus: 1, lastMessageAt: -1 });
ConversationSchema.index({ businessId: 1, participantId: 1, channel: 1 }, { unique: true, sparse: true });
ConversationSchema.index({ businessId: 1, isPinned: -1, lastMessageAt: -1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
