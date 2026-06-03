import WorkspaceRole from '@/models/access/WorkspaceRole';
import { BUILTIN_ROLES, getDefaultPermissionsForRole } from './catalog';

export async function ensureWorkspaceRoles(businessId, createdBy = null) {
  const existing = await WorkspaceRole.countDocuments({ businessId });
  if (existing > 0) return WorkspaceRole.find({ businessId }).lean();

  const docs = BUILTIN_ROLES.map((r) => ({
    businessId,
    slug: r.slug,
    name: r.name,
    description: r.description,
    systemRole: r.systemRole,
    permissions: getDefaultPermissionsForRole(r.slug),
    createdBy,
    active: true,
  }));

  await WorkspaceRole.insertMany(docs);
  return WorkspaceRole.find({ businessId }).lean();
}
