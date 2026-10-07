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
