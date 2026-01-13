import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CMS_Client',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  type: {
    type: String,
    enum: ['Status Change', 'Comment', 'File Upload', 'Task Update', 'Service Created', 'Auto Event'],
    required: true
  },
  action: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVisibleToClient: {
    type: Boolean,
    default: false
  },
  metadata: Map
}, {
  timestamps: true,
  collection: 'cms_activity_logs'
});

export default mongoose.models.CMS_ActivityLog || mongoose.model('CMS_ActivityLog', ActivityLogSchema);
