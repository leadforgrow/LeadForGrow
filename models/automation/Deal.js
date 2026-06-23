import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';

const ProductLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: true }
);

const DealSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    pipelineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    probability: { type: Number, default: 10, min: 0, max: 100 },
    stage: { type: String, default: 'new_lead', index: true },
    expectedCloseDate: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    products: [ProductLineSchema],
    tags: [{ type: String, trim: true }],
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    source: String,
    lostReason: String,
    wonReason: String,
    wonAt: Date,
    lostAt: Date,
    archived: { type: Boolean, default: false },
    archivedAt: Date,
  },
  { timestamps: true }
);

DealSchema.plugin(baseSchemaPlugin);

DealSchema.index({ businessId: 1, stage: 1, archived: 1 });
DealSchema.index({ businessId: 1, expectedCloseDate: 1 });
DealSchema.index({ businessId: 1, assignedTo: 1 });
DealSchema.index({ businessId: 1, pipelineId: 1, stage: 1 });
DealSchema.index({ businessId: 1, companyId: 1 });

export const DEAL_STAGES = [
  'new_lead',
  'qualified',
  'first_contact',
  'demo_scheduled',
  'demo_completed',
  'quotation_sent',
  'follow_up',
  'negotiation',
  'decision_pending',
  'payment_pending',
  'won',
  'lost',
];

export default mongoose.models.Deal || mongoose.model('Deal', DealSchema);
