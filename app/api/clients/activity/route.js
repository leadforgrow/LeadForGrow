import { dbConnect } from '@/lib/mongodb';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';

/**
 * @api {get} /api/clients/activity GET - List activity logs for a client
 */

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const businessId = searchParams.get('businessId');

    if (!businessId && !clientId) {
      return NextResponse.json({ error: 'businessId or clientId is required' }, { status: 400 });
    }

    let query = {};
    if (businessId) query.businessId = businessId;
    if (clientId) query.clientId = clientId;

    const logs = await CMS_ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName group');

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('[CMS_ACTIVITY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
