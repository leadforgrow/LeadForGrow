import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';
import User from '@/models/User';
import { resolveUserAccess, canPerformAction } from './resolver';

/**
 * Enforce plan + role permission on API routes.
 * Usage: withFeatureAccess('crm.leads', 'view', handler)
 */
export function withFeatureAccess(moduleId, action, handler) {
  return withAuth()(async (req, ...args) => {
    try {
      await dbConnect();
      if (!req.user?.businessId) {
        return NextResponse.json(
          { success: false, error: 'No workspace', code: 'NO_TENANT' },
          { status: 403 }
        );
      }

      const [business, user] = await Promise.all([
        Business.findById(req.user.businessId).lean(),
        User.findById(req.user.userId).lean(),
      ]);

      const access = await resolveUserAccess({
        userId: req.user.userId,
        businessId: req.user.businessId,
        business,
        user,
      });

      const check = canPerformAction(access, moduleId, action);
      if (!check.allowed) {
        return NextResponse.json(
          {
            success: false,
            error:
              check.reason === 'plan_locked'
                ? `Upgrade to ${access.modules[moduleId]?.upgradeLabel || 'a higher plan'} to access this feature.`
                : 'You do not have permission to perform this action.',
            code: check.reason === 'plan_locked' ? 'PLAN_LOCKED' : 'PERMISSION_DENIED',
            requiresUpgrade: check.reason === 'plan_locked',
            requiredTier: check.requiredTier,
          },
          { status: 403 }
        );
      }

      req.access = access;
      return handler(req, ...args);
    } catch (err) {
      console.error('[withFeatureAccess]', err);
      return NextResponse.json({ success: false, error: 'Access check failed' }, { status: 500 });
    }
  });
}
