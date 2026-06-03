export const MEETING_CATEGORY_LABELS = {
  demo_call: 'Demo Call',
  consultation: 'Consultation',
  sales_call: 'Sales Call',
  onboarding: 'Onboarding',
  team_meeting: 'Team Meeting',
  interview: 'Interview',
  support_session: 'Support Session',
};

export const DEFAULT_FORM_FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone / WhatsApp', type: 'phone', required: true },
];

export const DEFAULT_WHATSAPP_CONFIRMATION =
  'Hi {{name}}! Your {{meetingTitle}} with {{businessName}} is confirmed for {{dateTime}}. We look forward to speaking with you. Reply here if you need to reschedule.';

export const DEFAULT_WHATSAPP_REMINDER =
  'Reminder: Your {{meetingTitle}} with {{businessName}} starts in {{minutes}} minutes. Join: {{meetingLink}}';

export const DEFAULT_NO_SHOW_RECOVERY =
  'Hi {{name}}, we missed you at today\'s {{meetingTitle}}. Would you like to rebook? {{rebookLink}}';

export const DEFAULT_EMAIL_CONFIRMATION =
  'Your {{meetingTitle}} with {{businessName}} is confirmed for {{dateTime}}.';

export const DEFAULT_EMAIL_REMINDER =
  'Reminder: Your {{meetingTitle}} with {{businessName}} starts in {{minutes}} minutes.';

export const MEETING_STATUS_COLORS = {
  scheduled: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  confirmed: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  no_show: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  rescheduled: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
};
