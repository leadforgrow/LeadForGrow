import { dbConnect } from '@/lib/mongodb';
import CMS_Invoice from '@/models/cms/Invoice';
import { NextResponse } from 'next/server';

/**
 * @api {get} /api/clients/billing GET - List invoices for a client or business
 * @api {post} /api/clients/billing POST - Create invoice record (internal visibility)
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

    const invoices = await CMS_Invoice.find(query).sort({ dueDate: -1 });
    
    // Calculate simple MRR and Total Revenue for metrics
    const stats = {
      totalRevenue: invoices.reduce((sum, inv) => inv.status === 'Paid' ? sum + inv.amount : sum, 0),
      pendingRevenue: invoices.reduce((sum, inv) => inv.status === 'Pending' ? sum + inv.amount : sum, 0),
      overdueRevenue: invoices.reduce((sum, inv) => inv.status === 'Overdue' ? sum + inv.amount : sum, 0),
    };

    return NextResponse.json({ success: true, data: invoices, stats });
  } catch (error) {
    console.error('[CMS_BILLING_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.clientId || !body.businessId || !body.invoiceNumber || !body.amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await CMS_Invoice.create(body);
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error('[CMS_BILLING_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
