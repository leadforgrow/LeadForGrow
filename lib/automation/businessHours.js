/**
 * Business hours utilities for workflow delays and execution windows.
 */

const DAY_MAP = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

export function getAutomationSettings(business) {
  const settings = business?.settings?.automation || {};
  return {
    timezone: settings.timezone || business?.settings?.timezone || 'Asia/Kolkata',
    businessHours: settings.businessHours || {
      start: '09:00',
      end: '18:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    },
    workingDaysOnly: settings.workingDaysOnly !== false,
    maxExecutionsPerHour: settings.maxExecutionsPerHour || 500,
    retryPolicy: settings.retryPolicy || { maxRetries: 3, backoffMs: 5000 },
  };
}

export function isWithinBusinessHours(business, date = new Date()) {
  const { businessHours } = getAutomationSettings(business);
  const day = date.getDay();
  const allowedDays = (businessHours.days || []).map((d) => DAY_MAP[d] ?? -1);
  if (allowedDays.length && !allowedDays.includes(day)) return false;

  const [startH, startM] = (businessHours.start || '09:00').split(':').map(Number);
  const [endH, endM] = (businessHours.end || '18:00').split(':').map(Number);
  const mins = date.getHours() * 60 + date.getMinutes();
  const startMins = startH * 60 + (startM || 0);
  const endMins = endH * 60 + (endM || 0);
  return mins >= startMins && mins < endMins;
}

export function msUntilNextBusinessWindow(business, from = new Date()) {
  const { businessHours } = getAutomationSettings(business);
  const allowedDays = (businessHours.days || ['mon', 'tue', 'wed', 'thu', 'fri']).map((d) => DAY_MAP[d]);
  const [startH, startM] = (businessHours.start || '09:00').split(':').map(Number);

  const probe = new Date(from);
  for (let i = 0; i < 8; i++) {
    if (allowedDays.includes(probe.getDay())) {
      const windowStart = new Date(probe);
      windowStart.setHours(startH, startM || 0, 0, 0);
      if (windowStart > from) return windowStart.getTime() - from.getTime();
      if (isWithinBusinessHours(business, from)) return 0;
    }
    probe.setDate(probe.getDate() + 1);
    probe.setHours(0, 0, 0, 0);
  }
  return 3600000;
}

export function adjustDelayForBusinessHours(business, delayMs) {
  if (!getAutomationSettings(business).workingDaysOnly) return delayMs;
  const target = new Date(Date.now() + delayMs);
  if (isWithinBusinessHours(business, target)) return delayMs;
  return delayMs + msUntilNextBusinessWindow(business, target);
}
