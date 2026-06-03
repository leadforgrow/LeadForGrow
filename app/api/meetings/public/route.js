import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getPublicMeetingBySlug } from '@/lib/meetings/bookingEngine';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug required' }, { status: 400 });
    }

    const data = await getPublicMeetingBySlug(slug);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Booking page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Public Meeting]', error);
    return NextResponse.json({ success: false, error: 'Failed to load booking page' }, { status: 500 });
  }
}
