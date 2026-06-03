import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import { getAnalyticsReport } from '@/lib/meetings/analytics';

export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const data = await getAnalyticsReport(req.user.businessId, days);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Meetings Analytics]', error);
    return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 });
  }
});
