import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import AutomationSequence from '@/models/automation/AutomationSequence';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
        }

        const sequences = await AutomationSequence.find({ businessId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: sequences });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { businessId, name, description, steps } = body;

        if (!businessId || !name) {
            return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 });
        }

        const newSequence = await AutomationSequence.create({
            businessId,
            name,
            description,
            steps: steps || []
        });

        return NextResponse.json({ success: true, data: newSequence });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
