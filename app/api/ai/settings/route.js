import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withAuth } from '@/lib/auth';
import { getAiSettings, updateAiSettings } from '@/lib/ai/settings';
import { isAiConfigured } from '@/lib/ai/providers';

export const GET = withAuth()(async (req) => {
  try {
    await dbConnect();
    const settings = await getAiSettings(req.user.businessId);
    return NextResponse.json({
      success: true,
      data: { ...settings, configured: isAiConfigured() },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withAuth()(async (req) => {
  try {
    await dbConnect();
    const body = await req.json();
    const settings = await updateAiSettings(req.user.businessId, body);
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
