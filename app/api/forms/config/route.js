import { NextResponse } from 'next/server';
import { dbConnect } from "@/lib/mongodb";
import Form from '@/models/Form';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    await dbConnect();
    const form = await Form.findOne({ token, active: true }).lean();

    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found or inactive' }, { status: 404 });
    }

    // Return only necessary public data for the widget
    return NextResponse.json({
      success: true,
      data: {
        id: form._id,
        token: form.token,
        name: form.name,
        description: form.description || '',
        fields: form.fields,
        styling: form.styling,
        successMessage: form.successMessage,
        redirectUrl: form.redirectUrl
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('[Form Config API] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
