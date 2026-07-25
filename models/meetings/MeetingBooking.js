import mongoose from 'mongoose';

const MeetingBookingSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    meetingTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeetingType',
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    guest: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      company: { type: String, trim: true },
      notes: { type: String, trim: true },
      customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    source: {
      type: String,
      enum: ['booking_link', 'manual', 'rebook', 'api', 'whatsapp'],
      default: 'booking_link',
    },
    status: {
      type: String,
      enum: [
        'scheduled',
        'confirmed',
        'completed',
        'cancelled',
        'no_show',
        'rescheduled',
      ],
      default: 'scheduled',
      index: true,
    },
    meetingLink: { type: String, trim: true },
    calendarEventId: { type: String, trim: true },
    rebookToken: { type: String, trim: true, index: true },
    revenueValue: { type: Number, default: 0 },
    noShowRecoverySent: { type: Boolean, default: false },
    whatsappConfirmationSent: { type: Boolean, default: false },
    emailConfirmationSent: { type: Boolean, default: false },
    remindersScheduled: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    recordingLink: { type: String, trim: true },
    ai: {
      summary: { type: String },
      transcript: { type: String },
      followUpSuggestions: [String],
      objectionTags: [String],
      processedAt: { type: Date },
    },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
    noShowAt: { type: Date },
  },
  { timestamps: true }
);

MeetingBookingSchema.index({ businessId: 1, startTime: 1 });
MeetingBookingSchema.index({ businessId: 1, status: 1, startTime: -1 });
MeetingBookingSchema.index({ businessId: 1, assignedTo: 1, startTime: 1 });

if (mongoose.models.MeetingBooking) {
  delete mongoose.models.MeetingBooking;
}

export default mongoose.model('MeetingBooking', MeetingBookingSchema);
