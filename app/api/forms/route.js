import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import Business from '@/models/Business';
import User from '@/models/User';

// Helper to get user and business from request
async function getUserAndBusiness(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return { error: 'Authentication required', status: 401 };
  }
  
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }
  
  const business = await Business.findById(user.businessId);
  if (!business) {
    return { error: 'Business not found', status: 404 };
  }
  
  return { user, business };
}

// GET - List all forms for a business
export async function GET(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    
    const forms = await Form.find({ businessId: business._id, active: true })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 });
  }
}

// POST - Create new form
export async function POST(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const body = await request.json();
    
    // Check if business can create more forms
    if (!business.canCreateForm()) {
      return NextResponse.json({
        success: false,
        error: `Form limit reached. Your ${business.plan} plan allows ${business.quotas.maxForms} form(s).`,
        requiresUpgrade: true
      }, { status: 403 });
    }
    
    // Generate secure token
    const token = 'lfg_form_' + crypto.randomBytes(32).toString('hex');
    
    // Create form
    const form = await Form.create({
      businessId: business._id,
      name: body.name || 'Untitled Form',
      description: body.description || '',
      fields: body.fields || undefined, // Use default fields if not provided
      token,
      styling: body.styling || {},
      successMessage: body.successMessage || undefined,
      redirectUrl: body.redirectUrl || ''
    });
    
    // Increment business form count
    business.usage.formsCreated += 1;
    await business.save();
    
    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 });
  }
}

// PUT - Update form
export async function PUT(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const body = await request.json();
    const { formId, ...updates } = body;
    
    if (!formId) {
      return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });
    }
    
    // Find form and verify ownership
    const form = await Form.findOne({ _id: formId, businessId: business._id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    
    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'fields', 'styling', 'successMessage', 'redirectUrl', 'active'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        form[key] = updates[key];
      }
    });
    
    await form.save();
    
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 });
  }
}

// DELETE - Deactivate form
export async function DELETE(request) {
  try {
    const result = await getUserAndBusiness(request);
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    
    const { business } = result;
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    
    if (!formId) {
      return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });
    }
    
    // Find form and verify ownership
    const form = await Form.findOne({ _id: formId, businessId: business._id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    
    // Soft delete — removes from list; existing leads/submissions are kept
    form.active = false;
    await form.save();

    if (business.usage.formsCreated > 0) {
      business.usage.formsCreated -= 1;
      await business.save();
    }
    
    return NextResponse.json({ success: true, message: 'Form deleted' });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete form' }, { status: 500 });
  }
}
