import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import { ingestLead } from '@/lib/leadProcessor';

// Utility for CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
};

/**
 * POST /api/forms/submit
 * Universal endpoint for LeadForGrow Form Submissions (Native & Embedded)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { token, ...formData } = body;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Form token is required' }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    await dbConnect();

    // 1. Resolve Form and Business via token
    console.log('[Form Submit Debug] Received token:', token);
    const form = await Form.findOne({ token, active: true });
    console.log('[Form Submit Debug] Query result:', form ? `Found form: ${form.name}` : 'Form NOT FOUND');
    
    if (!form) {
      console.log('[Form Submit Debug] 404 Error: Invalid or inactive form');
      return NextResponse.json({ success: false, error: 'Invalid or inactive form' }, { 
        status: 404,
        headers: corsHeaders
      });
    }

    // 2. Extract client metadata
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const sourcePage = request.headers.get('referer') || '';

    // 3. Hand off to the Unified Ingestion Engine
    const result = await ingestLead(formData, form.businessId, {
      source: 'form',
      sourceDetails: `Form: ${form.name}`,
      formId: form._id,
      ipAddress,
      sourcePage,
      extra: {
        formName: form.name,
        formToken: token
      }
    });

    // 4. Update form analytics
    await form.recordSubmission();

    // 5. Response (Generic to prevent leaking internal business data)
    return NextResponse.json({
      success: true,
      message: form.successMessage || 'Thank you! We have received your inquiry.',
      redirectUrl: form.redirectUrl || null
    }, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('[Form Submission API] Error:', error);
    
    // Generic error message for public security
    return NextResponse.json({ 
      success: false, 
      error: 'Submission failed. Please try again later.' 
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

/**
 * OPTIONS - Handle CORS for embedded forms
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}
