import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getAgencyForUser } from '@/lib/agency/agencyGuards';

/**
 * GET /api/agency/invoices/[id]
 * Get a specific invoice
 */
export async function GET(request, { params }) {
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
    
    const { id } = await params;
    
    // Get invoice with ownership check
    const invoice = await Invoice.findOne({
      _id: id,
      agencyId: agency._id
    }).populate('clientId', 'clientName primaryContact');
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      invoice
    });
    
  } catch (error) {
    console.error('[Agency Invoice API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/agency/invoices/[id]
 * Update invoice status
 */
export async function PATCH(request, { params }) {
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
    
    const { id } = await params;
    
    // Get invoice with ownership check
    const invoice = await Invoice.findOne({
      _id: id,
      agencyId: agency._id
    });
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await request.json();
    const { status, notes } = body;
    
    // Update status
    if (status) {
      if (status === 'sent') {
        invoice.markAsSent();
      } else if (status === 'paid') {
        invoice.markAsPaid();
      } else if (status === 'overdue') {
        invoice.markAsOverdue();
      } else if (status === 'cancelled') {
        invoice.cancel();
      }
    }
    
    // Update notes
    if (notes !== undefined) {
      invoice.notes = notes;
    }
    
    await invoice.save();
    
    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice updated successfully'
    });
    
  } catch (error) {
    console.error('[Agency Invoice API] Error:', error);
    
    if (error.code === 'INVOICE_IMMUTABLE') {
      return NextResponse.json({
        error: 'Cannot modify a paid invoice'
      }, { status: 403 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
