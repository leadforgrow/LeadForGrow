import mongoose from 'mongoose';

const WorkspaceRoleSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    slug: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    systemRole: { type: Boolean, default: false },
    permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WorkspaceRoleSchema.index({ businessId: 1, slug: 1 }, { unique: true });

if (mongoose.models.WorkspaceRole) delete mongoose.models.WorkspaceRole;

export default mongoose.model('WorkspaceRole', WorkspaceRoleSchema);
