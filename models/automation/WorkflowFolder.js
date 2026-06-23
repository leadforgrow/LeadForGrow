import mongoose from 'mongoose';

const WorkflowFolderSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: 'blue' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowFolder', default: null },
  order: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

WorkflowFolderSchema.index({ businessId: 1, name: 1 });

export default mongoose.models.WorkflowFolder
  || mongoose.model('WorkflowFolder', WorkflowFolderSchema);
