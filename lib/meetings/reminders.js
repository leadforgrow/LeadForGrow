import MeetingReminder from '@/models/meetings/MeetingReminder';
import Business from '@/models/Business';
import { sendAutoWhatsApp } from '@/lib/integrations/whatsapp';
import { sendMeetingEmail } from '@/lib/meetings/email';
import {
  DEFAULT_WHATSAPP_CONFIRMATION,
  DEFAULT_WHATSAPP_REMINDER,
  DEFAULT_NO_SHOW_RECOVERY,
  DEFAULT_EMAIL_CONFIRMATION,
  DEFAULT_EMAIL_REMINDER,
} from './constants';

function renderTemplate(template, vars) {
  let out = template || '';
  Object.entries(vars).forEach(([key, val]) => {
    out = out.replace(new RegExp(`{{${key}}}`, 'g'), val ?? '');
  });
  return out;
}

export async function scheduleBookingReminders({ booking, meetingType, business }) {
  const rules = meetingType.automationRules || {};
  const reminders = [];

  if (rules.whatsappConfirmation !== false) {
    reminders.push({
      businessId: booking.businessId,
      bookingId: booking._id,
      channel: 'whatsapp',
      type: 'confirmation',
      scheduledFor: new Date(),
      payload: { template: rules.whatsappConfirmationTemplate },
    });
  }

  if (rules.emailReminder !== false && booking.guest?.email) {
    reminders.push({
      businessId: booking.businessId,
      bookingId: booking._id,
      channel: 'email',
      type: 'confirmation',
      scheduledFor: new Date(),
      payload: {
        template: rules.emailConfirmationTemplate || DEFAULT_EMAIL_CONFIRMATION,
      },
    });
  }

  if (rules.whatsappReminder !== false) {
    const minutes = rules.whatsappReminderMinutes ?? 30;
    const reminderTime = new Date(booking.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutes);
    if (reminderTime > new Date()) {
      reminders.push({
        businessId: booking.businessId,
        bookingId: booking._id,
        channel: 'whatsapp',
        type: 'reminder',
        scheduledFor: reminderTime,
        payload: { minutes, template: rules.whatsappReminderTemplate },
      });
    }
  }

  if (rules.emailReminder !== false && booking.guest?.email) {
    const minutes = rules.whatsappReminderMinutes ?? 30;
    const reminderTime = new Date(booking.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - minutes);
    if (reminderTime > new Date()) {
      reminders.push({
        businessId: booking.businessId,
        bookingId: booking._id,
        channel: 'email',
        type: 'reminder',
        scheduledFor: reminderTime,
        payload: {
          minutes,
          template: rules.emailReminderTemplate || DEFAULT_EMAIL_REMINDER,
        },
      });
    }
  }

  if (reminders.length) {
    await MeetingReminder.insertMany(reminders);
    booking.remindersScheduled = true;
    await booking.save();
  }

  // Process confirmation emails/WhatsApp immediately (don't wait for cron)
  await processPendingReminders(20);

  return booking;
}

export async function processPendingReminders(limit = 50) {
  const pending = await MeetingReminder.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() },
  })
    .sort({ scheduledFor: 1 })
    .limit(limit);

  const results = [];

  for (const reminder of pending) {
    try {
      const booking = await (
        await import('@/models/meetings/MeetingBooking')
      ).default.findById(reminder.bookingId);

      if (!booking || booking.status === 'cancelled') {
        reminder.status = 'cancelled';
        await reminder.save();
        continue;
      }

      const business = await Business.findById(reminder.businessId);
      if (!business) throw new Error('Business not found');

      const MeetingType = (await import('@/models/meetings/MeetingType')).default;
      const meetingType = await MeetingType.findById(booking.meetingTypeId);

      const vars = {
        name: booking.guest?.name || 'there',
        meetingTitle: meetingType?.title || 'meeting',
        businessName: business.businessName || 'our team',
        dateTime: new Date(booking.startTime).toLocaleString(),
        minutes: reminder.payload?.minutes ?? 30,
        meetingLink: booking.meetingLink || '',
        rebookLink: booking.rebookToken
          ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/book/${meetingType?.bookingSlug}?rebook=${booking.rebookToken}`
          : '',
      };

      if (reminder.channel === 'email') {
        const template =
          reminder.payload?.template ||
          (reminder.type === 'reminder' ? DEFAULT_EMAIL_REMINDER : DEFAULT_EMAIL_CONFIRMATION);
        const rendered = renderTemplate(template, vars);

        const emailResult = await sendMeetingEmail({
          booking,
          meetingType,
          business,
          type: reminder.type,
          templateOverride: rendered,
        });

        reminder.status = emailResult.success ? 'sent' : 'failed';
        reminder.sentAt = new Date();
        reminder.error = emailResult.error || emailResult.reason;
        await reminder.save();

        if (reminder.type === 'confirmation' && emailResult.success) {
          booking.emailConfirmationSent = true;
          await booking.save();
        }

        results.push({ id: reminder._id, channel: 'email', status: reminder.status });
        continue;
      }

      const lead = {
        name: booking.guest?.name || 'there',
        phone: booking.guest?.phone || booking.guest?.whatsapp,
        whatsapp: booking.guest?.whatsapp || booking.guest?.phone,
        email: booking.guest?.email,
      };

      let template = DEFAULT_WHATSAPP_CONFIRMATION;
      if (reminder.type === 'reminder') template = DEFAULT_WHATSAPP_REMINDER;
      if (reminder.type === 'no_show_recovery') template = DEFAULT_NO_SHOW_RECOVERY;
      if (reminder.payload?.template) template = reminder.payload.template;

      const message = renderTemplate(template, vars);
      const waResult = await sendAutoWhatsApp(lead, business, message);

      reminder.status = waResult.success ? 'sent' : 'failed';
      reminder.sentAt = new Date();
      reminder.error = waResult.error || waResult.reason;
      await reminder.save();

      if (reminder.type === 'confirmation' && waResult.success) {
        booking.whatsappConfirmationSent = true;
        await booking.save();
      }

      results.push({ id: reminder._id, channel: 'whatsapp', status: reminder.status });
    } catch (err) {
      reminder.status = 'failed';
      reminder.error = err.message;
      await reminder.save();
      results.push({ id: reminder._id, status: 'failed', error: err.message });
    }
  }

  return results;
}

export async function triggerNoShowRecovery(booking, meetingType, business) {
  const rebookToken = booking.rebookToken || (await import('./crmSync')).generateRebookToken();
  booking.rebookToken = rebookToken;
  booking.status = 'no_show';
  booking.noShowAt = new Date();
  booking.noShowRecoverySent = true;
  await booking.save();

  await MeetingReminder.create({
    businessId: booking.businessId,
    bookingId: booking._id,
    channel: 'whatsapp',
    type: 'no_show_recovery',
    scheduledFor: new Date(),
    payload: {},
  });

  if (meetingType.automationRules?.noShowRecoverySequenceId) {
    // Sequence trigger hook — future: enqueue sequence execution
  }

  return booking;
}
