import mongoose from 'mongoose';

const MEETING_CATEGORIES = [
  'demo_call',
  'consultation',
  'sales_call',
  'onboarding',
  'team_meeting',
  'interview',
  'support_session',
];

const MeetingTypeSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: MEETING_CATEGORIES,
      default: 'sales_call',
    },
    durationMinutes: { type: Number, default: 30, min: 5, max: 480 },
    bookingSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hostIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignmentMode: {
      type: String,
      enum: ['fixed', 'round_robin', 'priority', 'lead_score'],
      default: 'round_robin',
    },
    priorityHostIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    availabilityRules: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' },
      bufferBeforeMinutes: { type: Number, default: 0 },
      bufferAfterMinutes: { type: Number, default: 15 },
      dailyLimit: { type: Number, default: 0 },
      minNoticeHours: { type: Number, default: 2 },
      maxDaysAhead: { type: Number, default: 30 },
    },
    automationRules: {
      whatsappConfirmation: { type: Boolean, default: true },
      whatsappConfirmationTemplate: { type: String, trim: true },
      whatsappReminder: { type: Boolean, default: true },
      whatsappReminderMinutes: { type: Number, default: 30 },
      whatsappReminderTemplate: { type: String, trim: true },
      emailReminder: { type: Boolean, default: true },
      followUpSequenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutomationSequence',
      },
      noShowRecoverySequenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutomationSequence',
      },
      pipelineStageOnBook: { type: String, trim: true },
      leadStatusOnBook: { type: String, trim: true },
      triggerAutomationOnBook: { type: Boolean, default: true },
    },
    branding: {
      accentColor: { type: String, default: '#4338ca' },
      logoUrl: { type: String, trim: true },
      welcomeMessage: { type: String, trim: true },
      thankYouMessage: { type: String, trim: true },
    },
    formFields: [
      {
        name: { type: String, required: true },
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ['text', 'email', 'phone', 'textarea', 'select'],
          default: 'text',
        },
        required: { type: Boolean, default: false },
        options: [String],
        _id: false,
      },
    ],
    calendarIntegrations: {
      googleCalendar: { type: Boolean, default: false },
      outlook: { type: Boolean, default: false },
      zoom: { type: Boolean, default: false },
      googleMeet: { type: Boolean, default: true },
    },
    aiReady: {
      summariesEnabled: { type: Boolean, default: false },
      transcriptsEnabled: { type: Boolean, default: false },
      followUpSuggestions: { type: Boolean, default: false },
    },
    stats: {
      totalBookings: { type: Number, default: 0 },
      completedCount: { type: Number, default: 0 },
      noShowCount: { type: Number, default: 0 },
      revenueAttributed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

MeetingTypeSchema.index({ businessId: 1, status: 1 });
MeetingTypeSchema.index({ businessId: 1, bookingSlug: 1 }, { unique: true });

if (mongoose.models.MeetingType) {
  delete mongoose.models.MeetingType;
}

export { MEETING_CATEGORIES };
export default mongoose.model('MeetingType', MeetingTypeSchema);
