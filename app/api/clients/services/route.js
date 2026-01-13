import { dbConnect } from '@/lib/mongodb';
import { CMS_Service } from '@/models/cms/ServiceTask';
import CMS_ActivityLog from '@/models/cms/ActivityLog';
import { NextResponse } from 'next/server';

/**
 * @api {get} /api/clients/services GET - List services for a client
 * @api {post} /api/clients/services POST - Create a new service
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

    const services = await CMS_Service.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error('[CMS_SERVICE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { clientId, businessId, name, category, userId } = body;

    if (!clientId || !businessId || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await CMS_Service.create(body);

    // Initial Activity Log
    await CMS_ActivityLog.create({
      clientId,
      businessId,
      type: 'Service Created',
      action: `Service "${name}" initiated`,
      userId,
      isVisibleToClient: true
    });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    console.error('[CMS_SERVICE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
