import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import Agency from '@/models/Agency';
import User from '@/models/User';

// Helper to get workspace context (Agency)
async function getAgencyContext(request) {
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
  
  const agency = await Agency.findOne({ ownerId: userId });
  if (!agency) {
    return { error: 'Agency not found', status: 404 };
  }
  
  return { user, agency };
}

// GET - List all forms for an agency
export async function GET(request) {
  try {
    const { agency, error, status } = await getAgencyContext(request);
    if (error) return NextResponse.json({ success: false, error }, { status });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    let query = { agencyId: agency._id, active: true };
    if (clientId) query.clientId = clientId;
    
    const forms = await Form.find(query)
      .populate('clientId', 'clientName')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('[Agency Forms API] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch forms' }, { status: 500 });
  }
}

// POST - Create new form for agency client
export async function POST(request) {
  try {
    const { agency, error, status } = await getAgencyContext(request);
    if (error) return NextResponse.json({ success: false, error }, { status });

    const body = await request.json();
    
    // Generate secure token
    const token = 'lfg_form_' + crypto.randomBytes(32).toString('hex');
    
    // Create form
    const form = await Form.create({
      agencyId: agency._id,
      clientId: body.clientId,
      name: body.name || 'Untitled Form',
      description: body.description || '',
      fields: body.fields || undefined,
      token,
      styling: body.styling || {},
      successMessage: body.successMessage || undefined,
      redirectUrl: body.redirectUrl || ''
    });
    
    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    console.error('[Agency Forms API] POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create form' }, { status: 500 });
  }
}

// PUT - Update form
export async function PUT(request) {
  try {
    const { agency, error, status } = await getAgencyContext(request);
    if (error) return NextResponse.json({ success: false, error }, { status });

    const body = await request.json();
    const { formId, ...updates } = body;
    
    if (!formId) {
      return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });
    }
    
    const form = await Form.findOne({ _id: formId, agencyId: agency._id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    
    const allowedUpdates = ['name', 'description', 'fields', 'styling', 'successMessage', 'redirectUrl', 'active', 'clientId'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        form[key] = updates[key];
      }
    });
    
    await form.save();
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('[Agency Forms API] PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update form' }, { status: 500 });
  }
}

// DELETE - Deactivate form
export async function DELETE(request) {
  try {
    const { agency, error, status } = await getAgencyContext(request);
    if (error) return NextResponse.json({ success: false, error }, { status });

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    
    if (!formId) {
      return NextResponse.json({ success: false, error: 'Form ID required' }, { status: 400 });
    }
    
    const form = await Form.findOne({ _id: formId, agencyId: agency._id });
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found' }, { status: 404 });
    }
    
    form.active = false;
    await form.save();
    
    return NextResponse.json({ success: true, message: 'Form deactivated' });
  } catch (error) {
    console.error('[Agency Forms API] DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete form' }, { status: 500 });
  }
}
