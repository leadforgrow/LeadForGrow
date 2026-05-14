import mongoose from 'mongoose';

const RolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
    enum: ['SUPER_ADMIN', 'AGENCY_OWNER', 'CLIENT_ADMIN', 'TEAM_MEMBER', 'VIEW_ONLY', 'super', 'owner', 'admin', 'team_member', 'user']
  },
  permissions: [{
    type: String,
    enum: [
      'dashboard_access',
      'reports_access',
      'live_chat_access',
      'leads_view',
      'leads_edit',
      'leads_delete',
      'team_manage',
      'settings_manage',
      'billing_manage'
    ]
  }]
}, {
  timestamps: true
});

export default mongoose.models.RolePermission || mongoose.model('RolePermission', RolePermissionSchema);
