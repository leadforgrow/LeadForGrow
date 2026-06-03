import mongoose from 'mongoose';

const MeetingAnalyticsSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    meetingTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeetingType',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metrics: {
      bookings: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      noShows: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      avgResponseMinutes: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },
    sourceBreakdown: {
      booking_link: { type: Number, default: 0 },
      manual: { type: Number, default: 0 },
      rebook: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
    },
    hourlyDistribution: [{ hour: Number, count: Number, _id: false }],
  },
  { timestamps: true }
);

MeetingAnalyticsSchema.index(
  { businessId: 1, date: 1, meetingTypeId: 1, assignedTo: 1 },
  { unique: true, sparse: true }
);

if (mongoose.models.MeetingAnalytics) {
  delete mongoose.models.MeetingAnalytics;
}

export default mongoose.model('MeetingAnalytics', MeetingAnalyticsSchema);
