import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Broadcast from '@/models/automation/Broadcast';
import { withPlanAccess } from '@/lib/accessControl';
import { sendBroadcast, retryFailedRecipients } from '@/lib/broadcasts/engine';

export const GET = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const broadcast = await Broadcast.findOne({ _id: id, businessId: req.user.businessId }).lean();
    if (!broadcast) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: broadcast });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const broadcast = await Broadcast.findOne({ _id: id, businessId: req.user.businessId });
    if (!broadcast) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    ['name', 'description', 'channel', 'audience', 'content', 'scheduledAt', 'testMode', 'testRecipients'].forEach((k) => {
      if (body[k] !== undefined) broadcast.set(k, body[k]);
    });
    await broadcast.save();
    return NextResponse.json({ success: true, data: broadcast });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const DELETE = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    await Broadcast.deleteOne({ _id: id, businessId: req.user.businessId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PATCH = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const broadcast = await Broadcast.findOne({ _id: id, businessId: req.user.businessId });
    if (!broadcast) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (body.action === 'send') {
      await sendBroadcast(id);
    } else if (body.action === 'retry_failed') {
      await retryFailedRecipients(id);
    } else if (body.action === 'cancel') {
      broadcast.status = 'cancelled';
      await broadcast.save();
    }

    const updated = await Broadcast.findById(id).lean();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
