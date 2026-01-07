import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongodb';

/**
 * Helper to check if a user has access to premium features based on their plan.
 * @param {string} userId - The unique user ID.
 * @param {string} feature - The feature to check (e.g., 'automation', 'team', 'reports').
 * @returns {Promise<{authorized: boolean, error?: string, user?: object}>}
 */
export async function checkPlanAccess(userId, feature) {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    
    if (!user) {
      return { authorized: false, error: 'User not found' };
    }

    // Fetch Business to get the plan
    const Business = mongoose.models.Business || (await import('@/models/Business')).default;
    const business = await Business.findById(user.businessId);
    
    if (!business) {
      return { authorized: false, error: 'Business not found' };
    }

    // Plans: 'free', 'growth', 'enterprise'
    const plan = business.plan || 'free';

    // Premium features logic
    const premiumFeatures = ['automation', 'team', 'reports', 'integrations'];
    
    if (premiumFeatures.includes(feature) && plan === 'free') {
      return { 
        authorized: false, 
        error: 'Growth plan required to access this feature.',
        user 
      };
    }

    return { authorized: true, user };
  } catch (error) {
    console.error('Plan access check error:', error);
    return { authorized: false, error: 'Session error' };
  }
}

/**
 * Middleware-style wrapper for API routes to handle authorization
 */
export async function withPlanAccess(req, feature, handler) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { authorized, error, user } = await checkPlanAccess(userId, feature);

  if (!authorized) {
    return NextResponse.json({ 
      success: false, 
      error, 
      requiresUpgrade: true 
    }, { status: 403 });
  }

  return handler(req, user);
}
