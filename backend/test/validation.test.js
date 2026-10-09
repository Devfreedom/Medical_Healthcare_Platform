import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  daysInMonth,
  isFutureDate,
  isLeapYear,
  isValidDateString,
  MESSAGE_MAX_LENGTH,
  todayString,
  validateDateOfBirth,
  validateMessageBody,
  validateName,
  validateNotifications,
  validatePhone,
} from '../src/utils/validation.js';

describe('calendar date validation', () => {
  test('accepts real calendar dates', () => {
    assert.equal(isValidDateString('2024-01-01'), true);
    assert.equal(isValidDateString('2026-12-31'), true);
    assert.equal(isValidDateString('1999-06-15'), true);
  });

  test('rejects dates that do not exist', () => {
    assert.equal(isValidDateString('2026-02-31'), false, 'February 31 must be rejected');
    assert.equal(isValidDateString('2026-04-31'), false, 'April has 30 days');
    assert.equal(isValidDateString('2026-06-31'), false, 'June has 30 days');
    assert.equal(isValidDateString('2026-09-31'), false, 'September has 30 days');
    assert.equal(isValidDateString('2026-11-31'), false, 'November has 30 days');
    assert.equal(isValidDateString('2026-01-32'), false);
    assert.equal(isValidDateString('2026-00-10'), false);
    assert.equal(isValidDateString('2026-13-01'), false);
    assert.equal(isValidDateString('2026-01-00'), false);
    assert.equal(isValidDateString('2026-02-00'), false);
  });

  test('handles leap years correctly', () => {
    assert.equal(isValidDateString('2024-02-29'), true, '2024 is a leap year');
    assert.equal(isValidDateString('2023-02-29'), false, '2023 is not a leap year');
    assert.equal(isValidDateString('1900-02-29'), false, '1900 is not a leap year');
    assert.equal(isValidDateString('2000-02-29'), true, '2000 is a leap year');
    assert.equal(isValidDateString('2100-02-29'), false, '2100 is not a leap year');

    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2023), false);
    assert.equal(isLeapYear(1900), false);
    assert.equal(isLeapYear(2000), true);
  });

  test('reports month lengths', () => {
    assert.equal(daysInMonth(2024, 2), 29);
    assert.equal(daysInMonth(2023, 2), 28);
    assert.equal(daysInMonth(2026, 4), 30);
    assert.equal(daysInMonth(2026, 1), 31);
  });

  test('rejects malformed input', () => {
    assert.equal(isValidDateString('26-01-01'), false);
    assert.equal(isValidDateString('2026-1-1'), false);
    assert.equal(isValidDateString('01/01/2026'), false);
    assert.equal(isValidDateString(''), false);
    assert.equal(isValidDateString(null), false);
    assert.equal(isValidDateString(undefined), false);
    assert.equal(isValidDateString(20260101), false);
  });

  test('detects future dates', () => {
    assert.equal(isFutureDate('2999-01-01'), true);
    assert.equal(isFutureDate('2026-02-31'), false, 'invalid dates are never future dates');
    assert.equal(isFutureDate(todayString()), false, 'today is not in the future');
  });
});

describe('name validation', () => {
  test('trims whitespace and accepts normal names', () => {
    const result = validateName('  Ada Lovelace  ');
    assert.equal(result.ok, true);
    assert.equal(result.value, 'Ada Lovelace');
  });

  test('rejects names shorter than two characters', () => {
    assert.equal(validateName('A').ok, false);
    assert.equal(validateName('A ').ok, false);
    assert.equal(validateName('   ').ok, false);
    assert.equal(validateName('').ok, false);
  });

  test('rejects names longer than the maximum', () => {
    assert.equal(validateName('a'.repeat(100)).ok, true);
    assert.equal(validateName('a'.repeat(101)).ok, false);
  });

  test('rejects non-strings', () => {
    assert.equal(validateName(null).ok, false);
    assert.equal(validateName(12345).ok, false);
    assert.equal(validateName({}).ok, false);
  });
});

describe('date of birth validation', () => {
  test('accepts a past calendar date', () => {
    const result = validateDateOfBirth('1990-05-20');
    assert.equal(result.ok, true);
    assert.equal(result.value, '1990-05-20');
  });

  test('rejects a future date of birth', () => {
    const result = validateDateOfBirth('2999-01-01');
    assert.equal(result.ok, false);
    assert.match(result.message, /future/i);
  });

  test('rejects impossible calendar dates', () => {
    assert.equal(validateDateOfBirth('2026-02-31').ok, false);
    assert.equal(validateDateOfBirth('2023-02-29').ok, false);
  });

  test('allows intentionally clearing the field', () => {
    assert.deepEqual(validateDateOfBirth(''), { ok: true, value: null, message: null });
    assert.deepEqual(validateDateOfBirth(null), { ok: true, value: null, message: null });
  });

  test('leaves an omitted field undefined so it is not touched', () => {
    assert.deepEqual(validateDateOfBirth(undefined), { ok: true, value: undefined, message: null });
  });
});

describe('phone validation', () => {
  test('accepts ordinary international formatting', () => {
    for (const phone of ['+44 20 7946 0958', '(212) 555-0142', '+1-555-0100', '555.0100']) {
      assert.equal(validatePhone(phone).ok, true, `${phone} should be accepted`);
    }
  });

  test('enforces a maximum length', () => {
    const long = `+44 ${'1'.repeat(40)}`;
    const result = validatePhone(long);
    assert.equal(result.ok, false);
    assert.match(result.message, /32 characters or fewer/);
  });

  test('rejects letters and symbols', () => {
    assert.equal(validatePhone('call me').ok, false);
    assert.equal(validatePhone('+1-555-abc').ok, false);
    assert.equal(validatePhone('555#1234').ok, false);
  });

  test('requires at least one digit', () => {
    assert.equal(validatePhone('++++').ok, false);
  });

  test('allows clearing and omission', () => {
    assert.deepEqual(validatePhone(''), { ok: true, value: null, message: null });
    assert.deepEqual(validatePhone(undefined), { ok: true, value: undefined, message: null });
  });
});

describe('notification preference validation', () => {
  test('accepts booleans', () => {
    const result = validateNotifications({ appointments: false, results: true });
    assert.equal(result.ok, true);
    assert.deepEqual(result.value, { appointments: false, results: true });
  });

  test('rejects wrong types instead of silently coercing them', () => {
    assert.equal(validateNotifications({ appointments: 'yes' }).ok, false);
    assert.equal(validateNotifications({ results: 1 }).ok, false);
    assert.equal(validateNotifications({ billing: null }).ok, false);
    assert.equal(validateNotifications({ appointments: 'true' }).ok, false);
  });

  test('rejects unknown keys and non-objects', () => {
    assert.equal(validateNotifications({ sms: true }).ok, false);
    assert.equal(validateNotifications('all').ok, false);
    assert.equal(validateNotifications([true]).ok, false);
  });

  test('allows an omitted or null object', () => {
    assert.deepEqual(validateNotifications(undefined).value, {});
    assert.deepEqual(validateNotifications(null).value, {});
  });
});

describe('message validation', () => {
  test('trims and accepts a normal message', () => {
    const result = validateMessageBody('  Hello, please call me.  ');
    assert.equal(result.ok, true);
    assert.equal(result.value, 'Hello, please call me.');
  });

  test('rejects blank and whitespace-only messages', () => {
    assert.equal(validateMessageBody('').ok, false);
    assert.equal(validateMessageBody('   ').ok, false);
    assert.equal(validateMessageBody('\n\t ').ok, false);
  });

  test('rejects non-string bodies', () => {
    assert.equal(validateMessageBody(null).ok, false);
    assert.equal(validateMessageBody(undefined).ok, false);
    assert.equal(validateMessageBody({ text: 'hi' }).ok, false);
    assert.equal(validateMessageBody(123).ok, false);
  });

  test('enforces the maximum length', () => {
    assert.equal(validateMessageBody('a'.repeat(MESSAGE_MAX_LENGTH)).ok, true);
    assert.equal(validateMessageBody('a'.repeat(MESSAGE_MAX_LENGTH + 1)).ok, false);
  });
});