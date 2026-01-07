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
    
    // For now, we allow automation for everyone to make it "fully SaaS"
    // Other premium features (team, reports) still require Growth plan
    if (premiumFeatures.includes(feature) && plan === 'free' && feature !== 'automation') {
      return { 
        authorized: false, 
        error: `${feature.charAt(0).toUpperCase() + feature.slice(1)} requires Growth plan.`,
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
  // Check multiple possible sources for userId
  let userId = searchParams.get('userId') || searchParams.get('userid');
  
  // Also check headers if not in query params
  if (!userId) {
    userId = req.headers.get('x-user-id') || req.headers.get('userId');
  }

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
