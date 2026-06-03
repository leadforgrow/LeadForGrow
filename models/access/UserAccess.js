import mongoose from 'mongoose';

const UserAccessSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkspaceRole',
    },
    roleSlug: { type: String, trim: true, lowercase: true },
    featureOverrides: { type: mongoose.Schema.Types.Mixed, default: {} },
    moduleOverrides: { type: mongoose.Schema.Types.Mixed, default: {} },
    workspaceIds: [{ type: String }],
    suspended: { type: Boolean, default: false },
    department: { type: String, trim: true },
  },
  { timestamps: true }
);

UserAccessSchema.index({ businessId: 1, userId: 1 }, { unique: true });

if (mongoose.models.UserAccess) delete mongoose.models.UserAccess;

export default mongoose.model('UserAccess', UserAccessSchema);
