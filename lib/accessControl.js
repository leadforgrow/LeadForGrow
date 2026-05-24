import { NextResponse } from 'next/server';
import { withAuth } from './auth';
import { checkPlanAccess } from './plans';

export { checkPlanAccess };

/**
 * Middleware for feature-based plan access.
 * Only the free plan is feature-gated; trial/growth/pro/premium/enterprise get full access.
 * Team size and form limits are enforced via Business.quotas, not feature flags.
 */
export function withPlanAccess(feature, handler) {
  return withAuth()(async (req, ...args) => {
    const user = req.user;
    const { authorized, error, requiresUpgrade } = checkPlanAccess(user, feature);

    if (!authorized) {
      return NextResponse.json({
        success: false,
        error,
        requiresUpgrade: requiresUpgrade ?? true
      }, { status: 403 });
    }

    return handler(req, ...args);
  });
}
