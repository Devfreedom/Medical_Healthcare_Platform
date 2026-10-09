import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import { validateProfilePayload } from '../src/controllers/profileController.js';

describe('profile payload validation', () => {
  test('accepts a fully valid update', () => {
    const result = validateProfilePayload({
      name: '  Grace Hopper  ',
      dateOfBirth: '1906-12-09',
      phone: '+1 (555) 010-1234',
      notifications: { appointments: true, results: false, billing: true },
    });

    assert.equal(result.error, undefined);
    assert.equal(result.value.name, 'Grace Hopper');
    assert.equal(result.value.dateOfBirth, '1906-12-09');
    assert.equal(result.value.phone, '+1 (555) 010-1234');
    assert.deepEqual(result.value.notifications, { appointments: true, results: false, billing: true });
  });

  test('rejects an empty or too-short name with 422', () => {
    for (const name of ['', '   ', 'A']) {
      const result = validateProfilePayload({ name });
      assert.equal(result.error.status, 422, `${JSON.stringify(name)} should be rejected`);
      assert.ok(result.error.body.message);
    }
  });

  test('rejects an over-long name with 422', () => {
    const result = validateProfilePayload({ name: 'a'.repeat(101) });
    assert.equal(result.error.status, 422);
  });

  test('rejects impossible and future dates of birth with 422', () => {
    for (const dateOfBirth of ['2026-02-31', '2023-02-29', '2999-12-31', '2026-13-01', 'not-a-date']) {
      const result = validateProfilePayload({ dateOfBirth });
      assert.equal(result.error.status, 422, `${dateOfBirth} should be rejected`);
    }
  });

  test('supports clearing date of birth and phone', () => {
    const result = validateProfilePayload({ dateOfBirth: '', phone: '' });
    assert.equal(result.error, undefined);
    assert.equal(result.value.dateOfBirth, null);
    assert.equal(result.value.phone, null);
  });

  test('leaves omitted fields undefined so stored values are preserved', () => {
    const result = validateProfilePayload({ name: 'Alan Turing' });
    assert.equal(result.value.dateOfBirth, undefined);
    assert.equal(result.value.phone, undefined);
    assert.deepEqual(result.value.notifications, {});
  });

  test('rejects an over-long phone number with 422', () => {
    const result = validateProfilePayload({ phone: `+44 ${'9'.repeat(40)}` });
    assert.equal(result.error.status, 422);
    assert.match(result.error.body.message, /32 characters or fewer/);
  });

  test('rejects non-boolean notification preferences with 422', () => {
    const result = validateProfilePayload({ notifications: { results: 'yes' } });
    assert.equal(result.error.status, 422);
    assert.match(result.error.body.message, /true or false/);
  });

  test('rejects a non-object body', () => {
    for (const body of ['nope', 42, ['a']]) {
      const result = validateProfilePayload(body);
      assert.equal(result.error, undefined, 'array/object bodies are treated as field maps');
    }
  });
});