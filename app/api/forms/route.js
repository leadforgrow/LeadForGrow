import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import { withTenantAuth, resolveTenant } from '@/lib/auth';
import { trackUsage } from '@/models/billing/UsageRecord';

export const GET = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const forms = await Form.find({ businessId: tenant.business._id, active: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 });
  }
});

export const POST = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { business } = tenant;
    const body = await req.json();

    if (!business.canCreateForm()) {
      return NextResponse.json(
        {
          success: false,
          error: `Form limit reached. Your ${business.plan} plan allows ${business.quotas.maxForms} form(s).`,
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    await dbConnect();
    const token = 'lfg_form_' + crypto.randomBytes(32).toString('hex');

    const form = await Form.create({
      businessId: business._id,
      name: body.name || 'Untitled Form',
      description: body.description || '',
      fields: body.fields || undefined,
      token,
      styling: body.styling || {},
      successMessage: body.successMessage || undefined,
      redirectUrl: body.redirectUrl || '',
    });

    business.usage.formsCreated += 1;
    await business.save();
    await trackUsage(business._id, 'forms');

    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 });
  }
});

export const PUT = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const body = await req.json();
    const { formId, ...updates } = body;

    if (!formId) {
      return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });
    }

    await dbConnect();
    const form = await Form.findOne({ _id: formId, businessId: tenant.business._id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }

    const allowedUpdates = ['name', 'description', 'fields', 'styling', 'successMessage', 'redirectUrl', 'active'];
    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) form[key] = updates[key];
    }

    await form.save();
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 });
  }
});

export const DELETE = withTenantAuth(async (req) => {
  try {
    const tenant = await resolveTenant(req);
    if (tenant.error) {
      return NextResponse.json({ success: false, error: tenant.error }, { status: tenant.status });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });
    }

    await dbConnect();
    const form = await Form.findOne({ _id: formId, businessId: tenant.business._id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }

    form.active = false;
    await form.save();

    if (tenant.business.usage.formsCreated > 0) {
      tenant.business.usage.formsCreated -= 1;
      await tenant.business.save();
    }

    return NextResponse.json({ success: true, message: 'Form deleted' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete form' }, { status: 500 });
  }
});
