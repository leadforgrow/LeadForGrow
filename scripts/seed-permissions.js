import { dbConnect } from './lib/mongodb';
import RolePermission from './models/RolePermission';

async function seedPermissions() {
  try {
    await dbConnect();

    const roles = [
      {
        role: 'owner',
        permissions: ['dashboard_access', 'reports_access', 'live_chat_access', 'leads_view', 'leads_edit', 'leads_delete', 'team_manage', 'settings_manage', 'billing_manage']
      },
      {
        role: 'admin',
        permissions: ['dashboard_access', 'reports_access', 'live_chat_access', 'leads_view', 'leads_edit', 'leads_delete', 'team_manage', 'settings_manage']
      },
      {
        role: 'team_member',
        permissions: ['dashboard_access', 'leads_view', 'leads_edit'] // Note: Missing reports_access, so no Live Chat by default
      }
    ];

    for (const r of roles) {
      await RolePermission.findOneAndUpdate(
        { role: r.role },
        { $set: { permissions: r.permissions } },
        { upsert: true, new: true }
      );
    }

    console.log('Permissions seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding permissions:', error);
    process.exit(1);
  }
}

seedPermissions();
