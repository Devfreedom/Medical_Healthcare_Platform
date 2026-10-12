// Africa/Lagos (WAT, UTC+1, no DST) scheduling helpers.
// Lagos is a fixed +01:00 offset, so wall times convert deterministically
// without a timezone library: `${date}T${time}:00+01:00` is unambiguous and
// Postgres TIMESTAMPTZ stores the true instant.
import { isValidDateString } from './validation.js';

export const CLINIC_TZ = 'Africa/Lagos';
export const SLOT_MINUTES = 30;
const LAGOS_OFFSET = '+01:00';
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const lagosDateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: CLINIC_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const lagosTimeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: CLINIC_TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function lagosTodayString(now = new Date()) {
  return lagosDateFmt.format(now);
}

export function isValidClockTime(value) {
  return typeof value === 'string' && TIME_RE.test(value.trim());
}

export function isAlignedToSlot(value) {
  if (!isValidClockTime(value)) return false;
  const minutes = Number(value.trim().slice(3, 5));
  return minutes === 0 || minutes === 30;
}

function toMinutes(clock) {
  const [h, m] = clock.trim().split(':').map(Number);
  return h * 60 + m;
}

// Wall time in Lagos -> UTC instant. Returns null for impossible inputs.
export function lagosWallToUTC(dateStr, clockStr) {
  if (!isValidDateString(dateStr) || !isValidClockTime(clockStr)) return null;
  const instant = new Date(`${dateStr.trim()}T${clockStr.trim()}:00${LAGOS_OFFSET}`);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

// UTC bounds [start, end) covering one Lagos calendar day.
export function lagosDayBoundsUTC(dateStr) {
  if (!isValidDateString(dateStr)) return null;
  const start = new Date(`${dateStr.trim()}T00:00:00${LAGOS_OFFSET}`);
  if (Number.isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export function toLagosDateKey(value) {
  if (!value) return '';
  return lagosDateFmt.format(new Date(value));
}

export function formatLagosTime(value) {
  if (!value) return '';
  return `${lagosTimeFmt.format(new Date(value))} WAT`;
}

export function isFutureInstant(value) {
  const t = new Date(value).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

// Validate a doctor-published working window and expand it into slot starts.
// Never generates partial slots: the window must divide evenly into 30 min.
export function validateAvailabilityWindow({ date, startTime, endTime } = {}) {
  const d = typeof date === 'string' ? date.trim() : '';
  const s = typeof startTime === 'string' ? startTime.trim() : '';
  const e = typeof endTime === 'string' ? endTime.trim() : '';

  if (!isValidDateString(d)) {
    return { ok: false, message: 'Choose a valid date (YYYY-MM-DD).' };
  }
  if (d <= lagosTodayString()) {
    return { ok: false, message: 'Availability must be for a future date.' };
  }
  if (!isValidClockTime(s) || !isValidClockTime(e)) {
    return { ok: false, message: 'Start and end times must be HH:MM (24-hour).' };
  }
  if (!isAlignedToSlot(s) || !isAlignedToSlot(e)) {
    return { ok: false, message: 'Times must align to 30-minute boundaries (:00 or :30).' };
  }
  const startMin = toMinutes(s);
  const endMin = toMinutes(e);
  if (startMin >= endMin) {
    return { ok: false, message: 'Start time must be before the end time.' };
  }
  const span = endMin - startMin;
  if (span % SLOT_MINUTES !== 0) {
    return { ok: false, message: 'The window must divide into complete 30-minute slots.' };
  }
  const slotCount = span / SLOT_MINUTES;
  if (slotCount < 1 || slotCount > 48) {
    return { ok: false, message: 'Choose a working window of 30 minutes to 24 hours.' };
  }
  const slots = [];
  for (let i = 0; i < slotCount; i += 1) {
    const mins = startMin + i * SLOT_MINUTES;
    const hh = String(Math.floor(mins / 60)).padStart(2, '0');
    const mm = String(mins % 60).padStart(2, '0');
    const clock = `${hh}:${mm}`;
    const startsAt = lagosWallToUTC(d, clock);
    if (!startsAt) return { ok: false, message: 'Choose a valid date (YYYY-MM-DD).' };
    slots.push({ startsAt, endsAt: new Date(startsAt.getTime() + SLOT_MINUTES * 60 * 1000) });
  }
  // Whole window must lie in the future (prevents publishing today's past hours
  // on a technically-"future" date edge and keeps the rule server-enforced).
  if (slots.length > 0 && slots[0].startsAt.getTime() <= Date.now()) {
    return { ok: false, message: 'Availability must be in the future.' };
  }
  return { ok: true, value: { date: d, startTime: s, endTime: e, slotCount, slots } };
}

export function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim())
  );
}
