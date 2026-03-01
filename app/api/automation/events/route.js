import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Event from '@/models/automation/Event';
import AutomationSequence from '@/models/automation/AutomationSequence';
import Lead from '@/models/automation/Lead';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ success: false, error: 'Business ID required' }, { status: 400 });
        }

        const events = await Event.find({ businessId })
            .populate('formId', 'name token')
            .sort({ date: -1 })
            .lean();

        // Enrich with lead counts
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const leadCount = await Lead.countDocuments({ eventId: event._id });
            const conversionCount = await Lead.countDocuments({ eventId: event._id, status: 'converted' });
            return { ...event, leadCount, conversionCount };
        }));

        return NextResponse.json({ success: true, data: enrichedEvents });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { businessId, name, description, date, location, formId, sequenceId } = body;

        if (!businessId || !name || !formId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const newEvent = await Event.create({
            businessId,
            name,
            description,
            date: date || new Date(),
            location,
            formId,
            sequenceId
        });

        return NextResponse.json({ success: true, data: newEvent });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
