import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { verifyClientOwnership } from '@/lib/agency/agencyGuards';
import { generateInvoiceNumber } from '@/lib/agency/invoiceNumber';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    const query = { agencyId: agency._id };
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;

    const invoices = await Invoice.find(query).populate('clientId', 'clientName').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      invoices,
      total: invoices.length,
      agency: {
        name: agency.agencyName,
        email: agency.contactEmail,
        phone: agency.contactPhone,
        address: agency.metadata?.get('address') || '',
        website: agency.metadata?.get('website') || '',
      },
    });
  } catch (error) {
    console.error('[Agency Invoices API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

export const POST = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const body = await req.json();
    const { clientId, amount, currency, billingPeriod, lineItems, notes, dueDate, projectTitle, agencyDetails, clientDetails } = body;

    if (!clientId || !amount || !billingPeriod) {
      return NextResponse.json({ error: 'Client ID, amount, and billing period are required' }, { status: 400 });
    }

    const isOwner = await verifyClientOwnership(clientId, agency._id.toString());
    if (!isOwner) {
      return NextResponse.json({ error: 'Client not found or does not belong to your agency' }, { status: 404 });
    }

    const clientData = await Client.findById(clientId);
    const invoiceNumber = await generateInvoiceNumber(agency._id.toString());

    const invoice = await Invoice.create({
      agencyId: agency._id,
      clientId,
      invoiceNumber,
      amount,
      currency: currency || 'INR',
      billingPeriod: {
        startDate: new Date(billingPeriod.startDate),
        endDate: new Date(billingPeriod.endDate),
      },
      lineItems: lineItems || [],
      notes,
      dueAt: dueDate ? new Date(dueDate) : null,
      status: 'draft',
      projectTitle,
      agencyDetails: agencyDetails || {
        name: agency.agencyName,
        email: agency.contactEmail,
        phone: agency.contactPhone,
        address: agency.metadata?.get('address') || '',
      },
      clientDetails: clientDetails || {
        name: clientData.clientName,
        email: clientData.primaryContact?.email,
        address: clientData.metadata?.get('address') || '',
      },
    });

    return NextResponse.json({ success: true, invoice, message: 'Invoice created successfully' }, { status: 201 });
  } catch (error) {
    console.error('[Agency Invoices API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
