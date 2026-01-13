import { dbConnect } from '@/lib/mongodb';
import CMS_Client from '@/models/cms/Client';
import { NextResponse } from 'next/server';

/**
 * @api {get} /api/clients GET - List clients
 * @api {post} /api/clients POST - Create client
 */

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    let query = { businessId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'primaryContact.name': { $regex: search, $options: 'i' } },
        { 'primaryContact.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch live metadata for the dashboard
    const [serviceCount, taskCount] = await Promise.all([
      import('@/models/cms/ServiceTask').then(m => m.CMS_Service.countDocuments({ businessId, status: 'In Progress' })),
      import('@/models/cms/ServiceTask').then(m => m.CMS_Task.countDocuments({ businessId, status: { $ne: 'Completed' }, dueDate: { $lte: new Date(new Date().setHours(23,59,59,999)) } }))
    ]);

    const clients = await CMS_Client.find(query)
      .sort({ createdAt: -1 })
      .populate('accountManager', 'firstName lastName email');

    return NextResponse.json({ 
      success: true, 
      data: clients,
      meta: {
        serviceCount,
        taskCount
      }
    });
  } catch (error) {
    console.error('[CMS_CLIENT_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Server-side validation
    if (!body.companyName || !body.businessId || !body.primaryContact?.name || !body.primaryContact?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate custom clientId if provided, or let default handle it
    const client = await CMS_Client.create(body);

    return NextResponse.json({ success: true, data: client }, { status: 201 });
  } catch (error) {
    console.error('[CMS_CLIENT_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
