/**
 * Generate available booking slots for a meeting type.
 */

function parseTime(timeStr) {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  return { hours: h, minutes: m || 0 };
}

function setTimeOnDate(date, hours, minutes) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function getDayOfWeek(date) {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function generateAvailableSlots({
  meetingType,
  existingBookings = [],
  fromDate = new Date(),
  daysAhead = 14,
  hostAvailability = null,
}) {
  const rules = meetingType.availabilityRules || {};
  const duration = meetingType.durationMinutes || 30;
  const bufferBefore = rules.bufferBeforeMinutes || 0;
  const bufferAfter = rules.bufferAfterMinutes || 15;
  const minNoticeMs = (rules.minNoticeHours ?? 2) * 60 * 60 * 1000;
  const workingDays = rules.workingDays || [1, 2, 3, 4, 5];
  const { hours: startH, minutes: startM } = parseTime(rules.startTime || '09:00');
  const { hours: endH, minutes: endM } = parseTime(rules.endTime || '18:00');
  const maxDays = Math.min(daysAhead, rules.maxDaysAhead || 30);
  const now = new Date();
  const earliest = new Date(now.getTime() + minNoticeMs);

  const slots = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);

  for (let day = 0; day < maxDays; day++) {
    const checkDate = new Date(cursor);
    checkDate.setDate(cursor.getDate() + day);

    if (!workingDays.includes(getDayOfWeek(checkDate))) continue;

    let slotStart = setTimeOnDate(checkDate, startH, startM);
    const dayEnd = setTimeOnDate(checkDate, endH, endM);

    let dailyCount = 0;
    const dailyLimit = rules.dailyLimit || 0;

    while (slotStart.getTime() + duration * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      const bufferedStart = new Date(slotStart.getTime() - bufferBefore * 60000);
      const bufferedEnd = new Date(slotEnd.getTime() + bufferAfter * 60000);

      if (slotStart >= earliest) {
        const conflict = existingBookings.some((b) => {
          const bStart = new Date(b.startTime);
          const bEnd = new Date(b.endTime);
          return overlaps(bufferedStart, bufferedEnd, bStart, bEnd);
        });

        const hostBlocked =
          hostAvailability?.blockedSlots?.some((block) => {
            const bs = new Date(block.start);
            const be = new Date(block.end);
            return overlaps(slotStart, slotEnd, bs, be);
          }) ?? false;

        if (!conflict && !hostBlocked) {
          if (dailyLimit === 0 || dailyCount < dailyLimit) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              label: formatSlotLabel(slotStart),
            });
            dailyCount++;
          }
        }
      }

      slotStart = new Date(slotStart.getTime() + (duration + bufferAfter) * 60000);
    }
  }

  return slots;
}

function formatSlotLabel(date) {
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function isSlotAvailable(slotStart, slotEnd, existingBookings, bufferMinutes = 15) {
  const bufferedEnd = new Date(new Date(slotEnd).getTime() + bufferMinutes * 60000);
  const bufferedStart = new Date(new Date(slotStart).getTime() - bufferMinutes * 60000);
  return !existingBookings.some((b) =>
    overlaps(bufferedStart, bufferedEnd, new Date(b.startTime), new Date(b.endTime))
  );
}
