import mongoose from 'mongoose';
import WorkspaceRole from '@/models/access/WorkspaceRole';
import UserAccess from '@/models/access/UserAccess';
import TeamMember from '@/models/automation/TeamMember';
import Lead from '@/models/automation/Lead';
import AutomationRule from '@/models/automation/AutomationRule';
import Form from '@/models/Form';
import { normalizePlan, getPlanQuotas } from '@/lib/plans';
import { ensureWorkspaceRoles } from './seed';
import {
  PLAN_TO_TIER,
  TIER_FEATURES,
  TIER_LABELS,
  FLAT_MODULES,
  MODULE_GROUPS,
  NAV_ID_TO_MODULE,
  moduleMeetsPlan,
  permissionsToMatrix,
} from './catalog';

const ADMIN_ROLES = ['owner', 'admin', 'super', 'super_admin', 'agency_owner'];

function mapTeamRoleToSlug(teamRole, userRole) {
  const r = (teamRole || userRole || '').toLowerCase();
  if (r === 'owner') return 'owner';
  if (r === 'admin' || r.includes('admin')) return 'admin';
  return 'sales_agent';
}

export async function resolveUserAccess({ userId, businessId, business, user }) {
  const bid = new mongoose.Types.ObjectId(String(businessId));
  const plan = normalizePlan(business?.plan || user?.plan);
  const tier = PLAN_TO_TIER[plan] || 'starter';
  const tierFeatures = TIER_FEATURES[tier] || TIER_FEATURES.starter;
  const quotas = business?.quotas || getPlanQuotas(plan);

  const roles = await ensureWorkspaceRoles(bid, userId);
  let accessRecord = await UserAccess.findOne({ businessId: bid, userId }).lean();
  const teamMember = await TeamMember.findOne({ businessId: bid, userId }).lean();

  const userRole = (user?.role || '').toLowerCase();
  const isOwner =
    userRole === 'owner' ||
    teamMember?.role === 'owner' ||
    String(business?.ownerId) === String(userId);

  let roleSlug = accessRecord?.roleSlug;
  if (!roleSlug) {
    roleSlug = isOwner ? 'owner' : mapTeamRoleToSlug(teamMember?.role, userRole);
  }

  if (isOwner) roleSlug = 'owner';

  const workspaceRole = roles.find((r) => r.slug === roleSlug) || roles.find((r) => r.slug === 'viewer');
  let permissions = workspaceRole?.permissions || {};

  if (accessRecord?.moduleOverrides && Object.keys(accessRecord.moduleOverrides).length) {
    permissions = { ...permissions, ...accessRecord.moduleOverrides };
  }

  const canManageAccess = ADMIN_ROLES.includes(roleSlug) || isOwner;

  const modules = {};
  for (const mod of FLAT_MODULES) {
    const acts = permissions[mod.id] || [];
    const planCheck = moduleMeetsPlan(mod.id, tier);
    const tierBlocked =
      mod.id === 'automation.sequences' && !tierFeatures.sequences
        ? { allowed: false, requiredTier: 'growth' }
        : mod.id === 'settings.api_keys' && !tierFeatures.api_access
          ? { allowed: false, requiredTier: 'scale' }
          : planCheck;

    modules[mod.id] = {
      actions: acts,
      canView: acts.includes('view') || acts.includes('manage'),
      planLocked: !tierBlocked.allowed,
      requiredTier: tierBlocked.requiredTier,
      upgradeLabel: tierBlocked.upgradeLabel || TIER_LABELS[tierBlocked.requiredTier],
    };
  }

  const navAccess = {};
  for (const [navId, moduleId] of Object.entries(NAV_ID_TO_MODULE)) {
    const m = modules[moduleId];
    navAccess[navId] = {
      allowed: m?.canView && !m?.planLocked,
      locked: m?.planLocked,
      denied: !m?.canView,
      requiredTier: m?.requiredTier,
      moduleId,
    };
  }

  return {
    userId: String(userId),
    businessId: String(bid),
    plan,
    tier,
    tierLabel: TIER_LABELS[tier],
    tierFeatures,
    roleSlug,
    roleName: workspaceRole?.name || roleSlug,
    isOwner,
    canManageAccess,
    suspended: accessRecord?.suspended || false,
    permissions,
    modules,
    navAccess,
    roles: roles.map((r) => ({
      id: String(r._id),
      slug: r.slug,
      name: r.name,
      description: r.description,
      systemRole: r.systemRole,
      permissions: r.permissions,
    })),
    matrix: permissionsToMatrix(
      Object.fromEntries(
        roles.map((r) => [r.slug, typeof r.permissions === 'object' ? r.permissions : {}])
      )
    ),
    quotas,
  };
}

export async function getWorkspaceUsage(businessId) {
  const bid = new mongoose.Types.ObjectId(String(businessId));
  const [teamCount, leadCount, rulesCount, formCount] = await Promise.all([
    TeamMember.countDocuments({ businessId: bid, active: true }),
    Lead.countDocuments({ businessId: bid, archived: false }),
    AutomationRule.countDocuments({ businessId: bid }),
    Form.countDocuments({ businessId: bid }),
  ]);

  return {
    teamSeats: teamCount,
    contacts: leadCount,
    automationRules: rulesCount,
    forms: formCount,
    whatsappConversations: 0,
    aiCredits: 0,
    apiRequests: 0,
    workflows: rulesCount,
  };
}

export function canPerformAction(access, moduleId, action = 'view') {
  if (access.isOwner) return { allowed: true };
  if (access.suspended) return { allowed: false, reason: 'suspended' };
  const mod = access.modules?.[moduleId];
  if (!mod) return { allowed: false, reason: 'unknown_module' };
  if (mod.planLocked) return { allowed: false, reason: 'plan_locked', requiredTier: mod.requiredTier };
  if (!mod.actions?.includes(action) && action !== 'view') {
    return { allowed: false, reason: 'permission_denied' };
  }
  if (action === 'view' && !mod.canView) return { allowed: false, reason: 'permission_denied' };
  return { allowed: true };
}
