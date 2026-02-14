import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
        index: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    },
    direction: {
        type: String,
        enum: ["incoming", "outgoing"],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: "whatsapp"
    },
    externalMessageId: {
        type: String,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for chronological performance per lead
MessageSchema.index({ leadId: 1, timestamp: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
