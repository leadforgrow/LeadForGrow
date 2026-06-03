import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { withPlanAccess } from '@/lib/accessControl';
import MeetingBooking from '@/models/meetings/MeetingBooking';
import MeetingAvailability from '@/models/meetings/MeetingAvailability';
import TeamMember from '@/models/automation/TeamMember';
import User from '@/models/User';

export const GET = withPlanAccess('automation', async (req) => {
  try {
    await dbConnect();
    const businessId = req.user.businessId;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const members = await TeamMember.find({ businessId, active: true }).lean();
    const userIds = members.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name email avatar').lean();
    const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]));

    const availability = await MeetingAvailability.find({ businessId }).lean();
    const availMap = Object.fromEntries(availability.map((a) => [String(a.userId), a]));

    const stats = await MeetingBooking.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          booked: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] },
          },
          revenue: { $sum: '$revenueValue' },
          upcoming: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['scheduled', 'confirmed']] },
                    { $gte: ['$startTime', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = Object.fromEntries(stats.map((s) => [String(s._id), s]));

    const team = members.map((m) => {
      const uid = String(m.userId);
      const s = statsMap[uid] || {};
      const booked = s.booked || 0;
      return {
        userId: m.userId,
        name: userMap[uid]?.name || 'Team member',
        email: userMap[uid]?.email,
        avatar: userMap[uid]?.avatar,
        role: m.role,
        availability: availMap[uid] || null,
        metrics: {
          meetingsBooked: booked,
          completed: s.completed || 0,
          noShowRate: booked > 0 ? Math.round(((s.noShows || 0) / booked) * 100) : 0,
          conversionRate:
            booked > 0 ? Math.round(((s.completed || 0) / booked) * 100) : 0,
          revenue: s.revenue || 0,
          upcoming: s.upcoming || 0,
        },
      };
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error('[Meetings Team]', error);
    return NextResponse.json({ success: false, error: 'Failed to load team data' }, { status: 500 });
  }
});
