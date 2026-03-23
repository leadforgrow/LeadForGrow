import mongoose from 'mongoose';

const SequenceStepSchema = new mongoose.Schema({
    delayDays: {
        type: Number,
        default: 0
    },
    channel: {
        type: String,
        enum: ['whatsapp', 'email', 'both'],
        default: 'both'
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message' // Assuming Message model stores templates
    },
    emailSubject: {
        type: String,
        trim: true
    },
    messageTemplate: {
        type: String,
        trim: true
    }
}, { _id: true });

const AutomationSequenceSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    steps: [SequenceStepSchema],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.AutomationSequence || mongoose.model('AutomationSequence', AutomationSequenceSchema);
