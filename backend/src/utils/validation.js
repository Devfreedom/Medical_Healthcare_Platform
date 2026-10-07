export function isValidEmail(value) {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value.trim());
}

export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(time) === false;
}

export function isFutureDate(value) {
  if (!isValidDateString(value)) return false;
  const today = new Date().toISOString().slice(0, 10);
  return value > today;
}

export function toNullableString(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}
