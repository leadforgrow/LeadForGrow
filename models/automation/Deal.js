import mongoose from 'mongoose';

const STAGES = [
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const DealSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    probability: { type: Number, default: 10, min: 0, max: 100 },
    stage: { type: String, enum: STAGES, default: 'qualification', index: true },
    expectedCloseDate: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activities: [
      {
        type: { type: String },
        description: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notes: String,
    source: String,
    lostReason: String,
    wonAt: Date,
    lostAt: Date,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DealSchema.index({ businessId: 1, stage: 1, archived: 1 });
DealSchema.index({ businessId: 1, expectedCloseDate: 1 });
DealSchema.index({ businessId: 1, assignedTo: 1 });

export { STAGES as DEAL_STAGES };

export default mongoose.models.Deal || mongoose.model('Deal', DealSchema);
