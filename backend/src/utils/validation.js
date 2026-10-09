export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const PHONE_MAX_LENGTH = 32;
export const MESSAGE_MAX_LENGTH = 2000;

export function isValidEmail(value) {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value.trim());
}

// Calendar-aware date validation. Date.parse() silently rolls impossible dates
// over (2026-02-31 becomes 2026-03-03), so the month length is checked
// explicitly, including the Gregorian leap-year rule.
export function isValidDateString(value) {
  if (typeof value !== 'string') return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;

  return true;
}

export function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function isFutureDate(value) {
  if (!isValidDateString(value)) return false;
  return value.trim() > todayString();
}

export function toNullableString(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

// Shared name rules so registration and profile updates cannot drift apart.
export function validateName(value) {
  if (typeof value !== 'string') {
    return { ok: false, value: null, message: 'Name must be text.' };
  }

  const trimmed = value.trim();

  if (trimmed.length < NAME_MIN_LENGTH) {
    return { ok: false, value: null, message: `Name must be at least ${NAME_MIN_LENGTH} characters.` };
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return { ok: false, value: null, message: `Name must be ${NAME_MAX_LENGTH} characters or fewer.` };
  }

  return { ok: true, value: trimmed, message: null };
}

// Date of birth is validated as a real calendar date that is not in the future.
// An empty string or null means "clear this field" and is allowed.
export function validateDateOfBirth(value) {
  if (value === undefined) return { ok: true, value: undefined, message: null };
  if (value === null || value === '') return { ok: true, value: null, message: null };

  if (typeof value !== 'string') {
    return { ok: false, value: null, message: 'Date of birth must be a YYYY-MM-DD date.' };
  }

  const trimmed = value.trim();

  if (!isValidDateString(trimmed)) {
    return { ok: false, value: null, message: 'Enter a valid date of birth.' };
  }

  if (trimmed > todayString()) {
    return { ok: false, value: null, message: 'Date of birth cannot be in the future.' };
  }

  return { ok: true, value: trimmed, message: null };
}

// Phone accepts ordinary international formatting (spaces, +, (), -, .) and
// treats an empty value as an intentional clear. An absent field stays absent.
export function validatePhone(value) {
  if (value === undefined) return { ok: true, value: undefined, message: null };
  if (value === null || value === '') return { ok: true, value: null, message: null };

  if (typeof value !== 'string') {
    return { ok: false, value: null, message: 'Phone number must be text.' };
  }

  const trimmed = value.trim();

  if (trimmed === '') return { ok: true, value: null, message: null };

  if (trimmed.length > PHONE_MAX_LENGTH) {
    return { ok: false, value: null, message: `Phone number must be ${PHONE_MAX_LENGTH} characters or fewer.` };
  }

  if (!/^[0-9+()\-.\s]+$/.test(trimmed)) {
    return { ok: false, value: null, message: 'Enter a valid phone number.' };
  }

  if (!/\d/.test(trimmed)) {
    return { ok: false, value: null, message: 'Phone number must contain at least one digit.' };
  }

  return { ok: true, value: trimmed, message: null };
}

// Notification preferences are booleans only. Anything else is a 422 rather
// than being silently coerced to the existing value.
export function validateNotifications(value) {
  if (value === undefined || value === null) return { ok: true, value: {}, message: null };

  if (typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, value: {}, message: 'Notification preferences must be an object.' };
  }

  const allowed = ['appointments', 'results', 'billing'];
  const result = {};

  for (const [key, entry] of Object.entries(value)) {
    if (!allowed.includes(key)) {
      return { ok: false, value: {}, message: `Unknown notification preference: ${key}.` };
    }
    if (typeof entry !== 'boolean') {
      return { ok: false, value: {}, message: `Notification preference "${key}" must be true or false.` };
    }
    result[key] = entry;
  }

  return { ok: true, value: result, message: null };
}

export function validateMessageBody(value) {
  if (typeof value !== 'string') {
    return { ok: false, value: null, message: 'Message must be text.' };
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { ok: false, value: null, message: 'Message must not be empty.' };
  }

  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      value: null,
      message: `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, value: trimmed, message: null };
}

export function validateThreadName(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, value: null, message: 'Choose a conversation.' };
  }

  const trimmed = value.trim();

  if (trimmed.length > NAME_MAX_LENGTH) {
    return { ok: false, value: null, message: `Conversation name must be ${NAME_MAX_LENGTH} characters or fewer.` };
  }

  return { ok: true, value: trimmed, message: null };
}

// Format a Postgres DATE (parsed by pg as a local-midnight Date) or a
// YYYY-MM-DD string as YYYY-MM-DD without UTC-shift day rollback.
export function formatDateOnly(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}