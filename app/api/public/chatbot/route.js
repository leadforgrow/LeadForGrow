import { NextResponse } from 'next/server';
import { ingestLead } from '@/lib/leadProcessor';
import { dbConnect } from '@/lib/mongodb';
import Business from '@/models/Business';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { businessId, name, email, phone, responses, supportType, supportMessage } = body;

    if (!businessId || !name || (!email && !phone)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Verify business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Business ID' 
      }, { status: 404 });
    }

    // Prepare lead data
    const leadData = {
      name,
      email,
      phone,
      serviceInterest: supportType === 'technical' ? 'Technical Support' : 'Sales Support',
      message: supportMessage || '',
      metadata: {
        botResponses: responses, // Array of { question, answer }
        supportType,
        supportMessage
      }
    };

    const metadata = {
      source: 'bot',
      sourceDetails: 'Website Chatbot',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    };

    const result = await ingestLead(leadData, businessId, metadata);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Lead captured successfully' 
      }, { status: 201 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process lead' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
