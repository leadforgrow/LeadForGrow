import MeetingAnalytics from '@/models/meetings/MeetingAnalytics';
import MeetingBooking from '@/models/meetings/MeetingBooking';
import User from '@/models/User';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function recordBookingAnalytics({ booking, meetingType }) {
  const date = startOfDay(booking.createdAt || new Date());
  const inc = {
    'metrics.bookings': 1,
    [`sourceBreakdown.${booking.source}`]: 1,
  };

  await MeetingAnalytics.findOneAndUpdate(
    {
      businessId: booking.businessId,
      date,
      meetingTypeId: meetingType._id,
      assignedTo: booking.assignedTo || null,
    },
    { $inc: inc, $setOnInsert: { businessId: booking.businessId, date } },
    { upsert: true }
  );
}

export async function getAnalyticsReport(businessId, days = 30) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  const [daily, byRep, bySource, hourly] = await Promise.all([
    MeetingAnalytics.aggregate([
      { $match: { businessId, date: { $gte: from } } },
      {
        $group: {
          _id: '$date',
          bookings: { $sum: '$metrics.bookings' },
          completed: { $sum: '$metrics.completed' },
          noShows: { $sum: '$metrics.noShows' },
          revenue: { $sum: '$metrics.revenue' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    MeetingBooking.aggregate([
      {
        $match: {
          businessId,
          createdAt: { $gte: from },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          bookings: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] },
          },
          revenue: { $sum: '$revenueValue' },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ]),
    MeetingBooking.aggregate([
      { $match: { businessId, createdAt: { $gte: from } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    MeetingBooking.aggregate([
      { $match: { businessId, createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $hour: '$startTime' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  const userIds = byRep.map((r) => r._id).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).select('name').lean();
  const userMap = Object.fromEntries(users.map((u) => [String(u._id), u.name]));

  const totals = daily.reduce(
    (acc, d) => ({
      bookings: acc.bookings + d.bookings,
      completed: acc.completed + d.completed,
      noShows: acc.noShows + d.noShows,
      revenue: acc.revenue + d.revenue,
    }),
    { bookings: 0, completed: 0, noShows: 0, revenue: 0 }
  );

  return {
    totals,
    noShowRate:
      totals.bookings > 0
        ? Math.round((totals.noShows / totals.bookings) * 100)
        : 0,
    conversionRate:
      totals.bookings > 0
        ? Math.round((totals.completed / totals.bookings) * 100)
        : 0,
    daily: daily.map((d) => ({
      date: d._id,
      bookings: d.bookings,
      completed: d.completed,
      noShows: d.noShows,
      revenue: d.revenue,
    })),
    topReps: byRep.map((r) => ({
      userId: r._id,
      name: userMap[String(r._id)] || 'Unassigned',
      bookings: r.bookings,
      completed: r.completed,
      noShows: r.noShows,
      revenue: r.revenue,
      conversionRate:
        r.bookings > 0 ? Math.round((r.completed / r.bookings) * 100) : 0,
    })),
    sources: bySource.map((s) => ({ source: s._id, count: s.count })),
    bestTimes: hourly.map((h) => ({ hour: h._id, count: h.count })),
  };
}
