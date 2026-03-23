import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Form from '@/models/Form';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
        }

        const form = await Form.findOne({ token, active: true }).lean();

        if (!form) {
            return NextResponse.json({ success: false, error: 'Form not found or inactive' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: form._id,
                name: form.name,
                description: form.description,
                fields: form.fields,
                styling: form.styling,
                successMessage: form.successMessage,
                redirectUrl: form.redirectUrl,
                token: form.token
            }
        });
    } catch (error) {
        console.error('Public form fetch error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
