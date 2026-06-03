import mongoose from 'mongoose';

/** Per-host availability overrides for team scheduling */
const MeetingAvailabilitySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
    blockedSlots: [
      {
        start: Date,
        end: Date,
        reason: String,
        _id: false,
      },
    ],
    maxMeetingsPerDay: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MeetingAvailabilitySchema.index({ businessId: 1, userId: 1 }, { unique: true });

if (mongoose.models.MeetingAvailability) {
  delete mongoose.models.MeetingAvailability;
}

export default mongoose.model('MeetingAvailability', MeetingAvailabilitySchema);
