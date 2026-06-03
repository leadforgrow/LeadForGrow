import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import MeetingType from '@/models/meetings/MeetingType';

export const GET = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const meetingType = await MeetingType.findOne({
      _id: id,
      businessId: req.user.businessId,
    }).lean();

    if (!meetingType) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: meetingType });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch meeting' }, { status: 500 });
  }
});

export const PATCH = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const allowed = [
      'title',
      'description',
      'category',
      'durationMinutes',
      'bookingSlug',
      'status',
      'hostIds',
      'assignmentMode',
      'priorityHostIds',
      'availabilityRules',
      'automationRules',
      'branding',
      'formFields',
      'calendarIntegrations',
      'aiReady',
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) updates[key] = body[key];
    });

    if (updates.bookingSlug) {
      const dup = await MeetingType.findOne({
        businessId: req.user.businessId,
        bookingSlug: updates.bookingSlug,
        _id: { $ne: id },
      });
      if (dup) {
        return NextResponse.json({ success: false, error: 'Slug already in use' }, { status: 400 });
      }
    }

    const meetingType = await MeetingType.findOneAndUpdate(
      { _id: id, businessId: req.user.businessId },
      updates,
      { new: true }
    );

    if (!meetingType) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: meetingType });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update meeting' }, { status: 500 });
  }
});

export const DELETE = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    await MeetingType.findOneAndUpdate(
      { _id: id, businessId: req.user.businessId },
      { status: 'archived' }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to archive meeting' }, { status: 500 });
  }
});
