import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        trim: true
    },
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    sequenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutomationSequence'
    },
    active: {
        type: Boolean,
        default: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

EventSchema.index({ businessId: 1, active: 1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
