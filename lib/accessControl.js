import { NextResponse } from 'next/server';
import { withAuth } from './auth';

/**
 * Check if a user has access to a specific feature based on their plan.
 * This is now refactored to use the context provided by withAuth.
 */
export function checkPlanAccess(user, feature) {
  if (!user) return { authorized: false, error: 'User not found' };

  const plan = user.plan || 'free';
  const role = user.role;

  // SUPER_ADMIN has access to everything
  if (role === 'SUPER_ADMIN') return { authorized: true };

  // Premium features logic
  const premiumFeatures = ['analytics', 'team', 'integrations', 'agency_features'];

  // Example logic:
  if (premiumFeatures.includes(feature) && plan === 'free') {
    return {
      authorized: false,
      error: `${feature.charAt(0).toUpperCase() + feature.slice(1)} requires a premium plan.`,
      user
    };
  }

  return { authorized: true };
}

/**
 * Middleware for feature-based plan access
 */
export function withPlanAccess(feature, handler) {
  return withAuth()(async (req, ...args) => {
    const user = req.user;
    const { authorized, error } = checkPlanAccess(user, feature);

    if (!authorized) {
      return NextResponse.json({
        success: false,
        error,
        requiresUpgrade: true
      }, { status: 403 });
    }

    return handler(req, ...args);
  });
}
