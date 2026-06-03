import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getUsageSummary } from '@/lib/agency/usageReader';
import { calculateUsagePercentage, calculateRemainingCapacity } from '@/lib/agency/limitChecker';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const summary = await getUsageSummary(agency._id.toString());

    return NextResponse.json({
      success: true,
      agency: {
        id: agency._id,
        name: agency.agencyName,
        plan: agency.planName,
        status: agency.status,
      },
      limits: summary.limits,
      usage: summary.usage,
      percentages: calculateUsagePercentage(summary.limits, { usage: summary.usage }),
      remaining: calculateRemainingCapacity(summary.limits, { usage: summary.usage }),
      billingPeriod: summary.billingPeriod,
    });
  } catch (error) {
    console.error('[Agency Usage API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
