import mongoose from 'mongoose';
import { baseSchemaPlugin } from '../baseSchema.js';
import { DEFAULT_DEAL_STAGES } from '@/lib/crm/pipelineStages';

export { DEFAULT_DEAL_STAGES };

const StageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    color: { type: String, default: '#6366f1' },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    isWon: { type: Boolean, default: false },
    isLost: { type: Boolean, default: false },
  },
  { _id: true }
);

const PipelineSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    entityType: { type: String, enum: ['deal', 'lead'], default: 'deal' },
    stages: { type: [StageSchema], default: [] },
    isDefault: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PipelineSchema.plugin(baseSchemaPlugin);

PipelineSchema.index({ businessId: 1, entityType: 1, isDefault: 1 });
PipelineSchema.index({ businessId: 1, archived: 1 });

export default mongoose.models.Pipeline || mongoose.model('Pipeline', PipelineSchema);
