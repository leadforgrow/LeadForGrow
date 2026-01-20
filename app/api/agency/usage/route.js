import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getAgencyForUser } from '@/lib/agency/agencyGuards';
import { getUsageSummary } from '@/lib/agency/usageReader';
import { calculateUsagePercentage, calculateRemainingCapacity } from '@/lib/agency/limitChecker';
import { resolveAgencyLimits } from '@/lib/agency/planResolver';

/**
 * GET /api/agency/usage
 * Get current usage and limits for an agency
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get agency for user
    const agency = await getAgencyForUser(userId);
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    
    // Get usage summary
    const summary = await getUsageSummary(agency._id.toString());
    
    // Calculate percentages
    const percentages = calculateUsagePercentage(summary.limits, { usage: summary.usage });
    
    // Calculate remaining capacity
    const remaining = calculateRemainingCapacity(summary.limits, { usage: summary.usage });
    
    return NextResponse.json({
      success: true,
      agency: {
        id: agency._id,
        name: agency.agencyName,
        plan: agency.planName,
        status: agency.status
      },
      limits: summary.limits,
      usage: summary.usage,
      percentages,
      remaining,
      billingPeriod: summary.billingPeriod
    });
    
  } catch (error) {
    console.error('[Agency Usage API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
