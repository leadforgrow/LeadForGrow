import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withAuth } from '@/lib/auth';
import { generateInsights } from '@/lib/ai/insights';

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const data = await generateInsights(req.user.businessId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
