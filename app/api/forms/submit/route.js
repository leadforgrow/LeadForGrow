import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';
import { processNewLead, triggerAutomationForLead } from '@/lib/leadProcessor';

/**
 * Public Form Submission Endpoint
 * This endpoint accepts form submissions from anywhere (embedded forms, external websites)
 * Authentication is done via form token, not user session
 */
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { token, ...formData } = body;
    
    // 1. Validate token
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Form token required'
      }, { status: 400 });
    }
    
    // 2. Find form by token
    const form = await Form.findOne({ token, active: true });
    if (!form) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or inactive form'
      }, { status: 404 });
    }
    
    // 3. Validate required fields
    const requiredFields = form.fields.filter(f => f.required);
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        missingFields.push(field.label);
      }
    }
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }
    
    // 4. Extract IP address for fraud detection
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // 5. Extract source page from referer
    const sourcePage = request.headers.get('referer') || 'direct';
    
    // 6. Process lead through centralized processor
    const leadData = {
      name: formData.name,
      email: formData.email || '',
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      serviceInterest: formData.serviceInterest || formData.service || '',
      message: formData.message || '',
      source: 'form',
      sourceDetails: form.name,
      sourcePage,
      ipAddress,
      metadata: {
        formId: form._id,
        formName: form.name,
        submittedAt: new Date().toISOString()
      }
    };
    
    const result = await processNewLead(leadData, form.businessId, form._id);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message || 'Failed to process lead'
      }, { status: 500 });
    }
    
    // 7. Update form submission count
    await form.recordSubmission();
    
    // 8. Trigger automation asynchronously (don't wait for it)
    if (!result.isDuplicate) {
      // Use setTimeout to trigger automation without blocking response
      setTimeout(() => {
        triggerAutomationForLead(result.lead._id, form.businessId).catch(err => {
          console.error('Automation trigger failed:', err);
        });
      }, 100);
    }
    
    // 9. Return success response (never expose business details)
    return NextResponse.json({
      success: true,
      message: form.successMessage || 'Thank you! We will get back to you soon.',
      redirectUrl: form.redirectUrl || null
    }, { status: 201 });
    
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({
      success: false,
      error: 'Submission failed. Please try again.'
    }, { status: 500 });
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
