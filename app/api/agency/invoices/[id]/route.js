import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const invoice = await Invoice.findOne({ _id: id, agencyId: req.agency._id }).populate(
      'clientId',
      'clientName primaryContact'
    );
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const PATCH = withAgencyAuth(async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const invoice = await Invoice.findOne({ _id: id, agencyId: req.agency._id });
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const { status, notes } = await req.json();
    if (status === 'sent') invoice.markAsSent();
    else if (status === 'paid') invoice.markAsPaid();
    else if (status === 'overdue') invoice.markAsOverdue();
    else if (status === 'cancelled') invoice.cancel();
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();
    return NextResponse.json({ success: true, invoice, message: 'Invoice updated successfully' });
  } catch (error) {
    if (error.code === 'INVOICE_IMMUTABLE') {
      return NextResponse.json({ error: 'Cannot modify a paid invoice' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
