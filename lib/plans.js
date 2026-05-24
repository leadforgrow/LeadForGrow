/**
 * Central plan definitions — quotas, enums, and access rules.
 * Admin can override quotas per-business via Business.quotas in the DB.
 */

export const BUSINESS_PLAN_ENUM = [
  'free',
  'trial',
  'growth',
  'pro',
  'premium',
  'enterprise',
  'agency starter',
  'agency growth',
  'agency pro'
];

/** Default quotas applied when plan changes (admin can override quotas afterward). */
export const PLAN_QUOTAS = {
  free: {
    maxForms: 1,
    maxTeamMembers: 1,
    maxAutomationRules: 3,
    maxLeadsPerMonth: 50
  },
  trial: {
    maxForms: 1,
    maxTeamMembers: 1,
    maxAutomationRules: 5,
    maxLeadsPerMonth: 200
  },
  growth: {
    maxForms: 3,
    maxTeamMembers: 3,
    maxAutomationRules: 15,
    maxLeadsPerMonth: 500
  },
  pro: {
    maxForms: 7,
    maxTeamMembers: 7,
    maxAutomationRules: 30,
    maxLeadsPerMonth: 2000
  },
  premium: {
    maxForms: 10,
    maxTeamMembers: 10,
    maxAutomationRules: 50,
    maxLeadsPerMonth: 5000
  },
  enterprise: {
    maxForms: 999999,
    maxTeamMembers: 999999,
    maxAutomationRules: 999999,
    maxLeadsPerMonth: 999999
  },
  'agency starter': {
    maxForms: 999999,
    maxTeamMembers: 999999,
    maxAutomationRules: 999999,
    maxLeadsPerMonth: 999999
  },
  'agency growth': {
    maxForms: 999999,
    maxTeamMembers: 999999,
    maxAutomationRules: 999999,
    maxLeadsPerMonth: 999999
  },
  'agency pro': {
    maxForms: 999999,
    maxTeamMembers: 999999,
    maxAutomationRules: 999999,
    maxLeadsPerMonth: 999999
  }
};

export const PLAN_LABELS = {
  free: 'Free',
  trial: 'Trial',
  growth: 'Growth',
  pro: 'Pro',
  premium: 'Premium',
  enterprise: 'Enterprise',
  'agency starter': 'Agency Starter',
  'agency growth': 'Agency Growth',
  'agency pro': 'Agency Pro'
};

/** Features gated only on the free plan — all paid plans get full access. */
export const FREE_PLAN_BLOCKED_FEATURES = ['integrations', 'team', 'analytics', 'agency_features'];

export function normalizePlan(plan) {
  return (plan || 'free').toLowerCase().trim();
}

export function getPlanLabel(plan) {
  return PLAN_LABELS[normalizePlan(plan)] || plan || 'Free';
}

export function isUnlimitedPlan(plan) {
  const p = normalizePlan(plan);
  return p === 'enterprise' || p.startsWith('agency');
}

export function isPaidPlan(plan) {
  return normalizePlan(plan) !== 'free';
}

export function getPlanQuotas(plan) {
  return PLAN_QUOTAS[normalizePlan(plan)] || PLAN_QUOTAS.free;
}

export function applyPlanQuotas(businessDoc, plan) {
  const defaults = getPlanQuotas(plan);
  if (!businessDoc.quotas) businessDoc.quotas = {};
  Object.assign(businessDoc.quotas, defaults);
}

export function checkPlanAccess(user, feature) {
  if (!user) return { authorized: false, error: 'User not found' };

  if (user.role === 'SUPER_ADMIN') return { authorized: true };

  const plan = normalizePlan(user.plan);

  if (plan === 'free' && FREE_PLAN_BLOCKED_FEATURES.includes(feature)) {
    const label = feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ');
    return {
      authorized: false,
      error: `${label} requires a paid plan. Start a free trial or upgrade to Growth.`,
      requiresUpgrade: true,
      user
    };
  }

  return { authorized: true };
}
