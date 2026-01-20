import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { getAgencyForUser, verifyClientOwnership } from '@/lib/agency/agencyGuards';
import { generateInvoiceNumber } from '@/lib/agency/invoiceNumber';

/**
 * GET /api/agency/invoices
 * List all invoices for an agency
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    
    // Build query
    const query = { agencyId: agency._id };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;
    
    // Get invoices
    const invoices = await Invoice.find(query)
      .populate('clientId', 'clientName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      invoices,
      total: invoices.length
    });
    
  } catch (error) {
    console.error('[Agency Invoices API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/agency/invoices
 * Create a new invoice
 */
export async function POST(request) {
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
    
    // Parse request body
    const body = await request.json();
    const { clientId, amount, currency, billingPeriod, lineItems, notes, dueDate } = body;
    
    // Validate required fields
    if (!clientId || !amount || !billingPeriod) {
      return NextResponse.json({
        error: 'Client ID, amount, and billing period are required'
      }, { status: 400 });
    }
    
    // Verify client belongs to agency
    const isOwner = await verifyClientOwnership(clientId, agency._id.toString());
    if (!isOwner) {
      return NextResponse.json({
        error: 'Client not found or does not belong to your agency'
      }, { status: 404 });
    }
    
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(agency._id.toString());
    
    // Create invoice
    const invoice = await Invoice.create({
      agencyId: agency._id,
      clientId,
      invoiceNumber,
      amount,
      currency: currency || 'INR',
      billingPeriod: {
        startDate: new Date(billingPeriod.startDate),
        endDate: new Date(billingPeriod.endDate)
      },
      lineItems: lineItems || [],
      notes,
      dueAt: dueDate ? new Date(dueDate) : null,
      status: 'draft'
    });
    
    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Agency Invoices API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
