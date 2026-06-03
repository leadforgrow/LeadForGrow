import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import { withAgencyAuth } from '@/lib/agency/withAgencyAuth';

export const GET = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const query = { agencyId: agency._id, active: true };
    if (clientId) query.clientId = clientId;

    const forms = await Form.find(query).populate('clientId', 'clientName').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('[Agency Forms API] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 });
  }
});

export const POST = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const body = await req.json();
    const token = 'lfg_form_' + crypto.randomBytes(32).toString('hex');

    const form = await Form.create({
      agencyId: agency._id,
      clientId: body.clientId,
      name: body.name || 'Untitled Form',
      description: body.description || '',
      fields: body.fields || undefined,
      token,
      styling: body.styling || {},
      successMessage: body.successMessage || undefined,
      redirectUrl: body.redirectUrl || '',
    });

    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error('[Agency Forms API] POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 });
  }
});

export const PUT = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const body = await req.json();
    const { formId, ...updates } = body;

    if (!formId) return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });

    const form = await Form.findOne({ _id: formId, agencyId: agency._id });
    if (!form) return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });

    const allowed = ['name', 'description', 'fields', 'styling', 'successMessage', 'redirectUrl', 'active', 'clientId'];
    for (const key of Object.keys(updates)) {
      if (allowed.includes(key)) form[key] = updates[key];
    }

    await form.save();
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('[Agency Forms API] PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 });
  }
});

export const DELETE = withAgencyAuth(async (req) => {
  try {
    await dbConnect();
    const agency = req.agency;
    const formId = new URL(req.url).searchParams.get('formId');
    if (!formId) return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });

    const form = await Form.findOne({ _id: formId, agencyId: agency._id });
    if (!form) return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });

    form.active = false;
    await form.save();
    return NextResponse.json({ success: true, message: 'Form deactivated' });
  } catch (error) {
    console.error('[Agency Forms API] DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete form' }, { status: 500 });
  }
});
