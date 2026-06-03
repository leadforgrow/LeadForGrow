import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { processPendingReminders } from '@/lib/meetings/reminders';

export async function GET(req) {
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const results = await processPendingReminders(100);
    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error('[Meeting Reminders Cron]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
