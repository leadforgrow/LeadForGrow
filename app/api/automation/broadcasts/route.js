import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Broadcast from '@/models/automation/Broadcast';
import { withPlanAccess } from '@/lib/accessControl';
import { sendBroadcast } from '@/lib/broadcasts/engine';

export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query = { businessId };
    if (status) query.status = status;

    const broadcasts = await Broadcast.find(query).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, data: broadcasts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const POST = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const userId = req.user.userId;
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: 'Broadcast name required' }, { status: 400 });
    }

    const broadcast = await Broadcast.create({
      businessId,
      name: body.name.trim(),
      description: body.description,
      channel: body.channel || 'whatsapp',
      status: body.sendNow ? 'sending' : (body.scheduledAt ? 'scheduled' : 'draft'),
      audience: body.audience || { type: 'filter', filters: {} },
      content: body.content || {},
      scheduledAt: body.scheduledAt,
      testMode: body.testMode || false,
      testRecipients: body.testRecipients || [],
      createdBy: userId,
    });

    if (body.sendNow || body.testSend) {
      await sendBroadcast(broadcast._id);
      const updated = await Broadcast.findById(broadcast._id).lean();
      return NextResponse.json({ success: true, data: updated }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: broadcast }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
