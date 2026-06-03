import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import MeetingBooking from '@/models/meetings/MeetingBooking';
import Activity from '@/models/automation/Activity';
import { triggerNoShowRecovery } from '@/lib/meetings/reminders';
import MeetingType from '@/models/meetings/MeetingType';
import Business from '@/models/Business';

export const PATCH = withPlanAccess('automation', async (req, { params }) => {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const booking = await MeetingBooking.findOne({
      _id: id,
      businessId: req.user.businessId,
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (body.status === 'no_show') {
      const meetingType = await MeetingType.findById(booking.meetingTypeId);
      const business = await Business.findById(booking.businessId);
      await triggerNoShowRecovery(booking, meetingType, business);
      if (booking.leadId) {
        await Activity.create({
          businessId: booking.businessId,
          leadId: booking.leadId,
          type: 'meeting_no_show',
          description: `No-show: ${meetingType?.title || 'meeting'}`,
          metadata: { bookingId: booking._id },
          performedBy: req.user.userId,
        });
      }
      return NextResponse.json({ success: true, data: booking });
    }

    const updates = {};
    if (body.status) {
      updates.status = body.status;
      if (body.status === 'completed') updates.completedAt = new Date();
      if (body.status === 'cancelled') updates.cancelledAt = new Date();
    }
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.revenueValue !== undefined) updates.revenueValue = body.revenueValue;

    const updated = await MeetingBooking.findByIdAndUpdate(id, updates, { new: true });

    if (body.status === 'completed' && updated.leadId) {
      await Activity.create({
        businessId: updated.businessId,
        leadId: updated.leadId,
        type: 'meeting_completed',
        description: 'Meeting completed successfully',
        metadata: { bookingId: updated._id },
        performedBy: req.user.userId,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
