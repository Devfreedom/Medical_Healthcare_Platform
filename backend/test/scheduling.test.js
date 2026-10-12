// Appointment scheduling tests: availability windows, slot booking,
// double-booking safety, isolation, timezone boundaries, migration safety.
// All DB access is stubbed (pool.query / pool.connect); no real database.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://stub:stub@localhost:5432/stub';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-used-anywhere-real';
process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after, describe } from 'node:test';

const {
  validateAvailabilityWindow,
  lagosWallToUTC,
  lagosDayBoundsUTC,
  toLagosDateKey,
  formatLagosTime,
} = await import('../src/utils/scheduling.js');
const { createAppointment } = await import('../src/controllers/appointmentController.js');
const {
  getDoctorAvailability,
  listMyAvailability,
  publishAvailability,
  deactivateSlot,
} = await import('../src/controllers/doctorController.js');
const { pool } = await import('../src/config/db.js');

const originalQuery = pool.query;
const originalConnect = pool.connect;
after(() => {
  pool.query = originalQuery;
  pool.connect = originalConnect;
});

const PATIENT_A = '11111111-1111-1111-1111-111111111111';
const PATIENT_B = '22222222-2222-2222-2222-222222222222';
const DOCTOR_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const SLOT_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

function makeRes() {
  return {
    statusCode: 200, body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}
const nextThrows = (e) => { throw e; };
function futureDate(offsetDays = 30) {
  return new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
}

describe('availability window validation', () => {
  test('accepts a valid window and expands 30-min slots', () => {
    const date = futureDate();
    const out = validateAvailabilityWindow({ date, startTime: '09:00', endTime: '10:00' });
    assert.equal(out.ok, true);
    assert.equal(out.value.slotCount, 2);
    assert.equal(out.value.slots.length, 2);
    assert.equal(out.value.slots[1].startsAt.getTime() - out.value.slots[0].startsAt.getTime(), 30 * 60 * 1000);
  });
  test('rejects misaligned, inverted, past, and malformed inputs', () => {
    const date = futureDate();
    for (const body of [
      { date, startTime: '09:15', endTime: '10:00' },
      { date, startTime: '10:00', endTime: '09:00' },
      { date, startTime: '09:00', endTime: '09:00' },
      { date: '2000-01-01', startTime: '09:00', endTime: '10:00' },
      { date: '2030-02-31', startTime: '09:00', endTime: '10:00' },
      { date, startTime: 'not-a-time', endTime: '10:00' },
      { date, startTime: '09:00', endTime: '09:20' },
    ]) {
      const out = validateAvailabilityWindow(body);
      assert.equal(out.ok, false, JSON.stringify(body));
    }
  });
});

describe('timezone correctness (Africa/Lagos)', () => {
  test('09:00 WAT stores as 08:00Z and stays on the same Lagos date', () => {
    const instant = lagosWallToUTC('2030-06-01', '09:00');
    assert.equal(instant.toISOString(), '2030-06-01T08:00:00.000Z');
    assert.equal(toLagosDateKey(instant), '2030-06-01');
    assert.equal(formatLagosTime(instant), '09:00 WAT');
  });
  test('late-night slot does not leak to the next day', () => {
    const instant = lagosWallToUTC('2030-06-01', '23:30');
    assert.equal(toLagosDateKey(instant), '2030-06-01');
    const bounds = lagosDayBoundsUTC('2030-06-01');
    assert.ok(instant >= bounds.start && instant < bounds.end);
    assert.equal(bounds.end.toISOString(), '2030-06-01T23:00:00.000Z');
  });
});

describe('patient availability endpoint', () => {
  test('returns only open slots, no patient data', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      if (/FROM users u/.test(text)) return { rowCount: 1, rows: [{ id: DOCTOR_A }] };
      if (/FROM doctor_availability_slots/.test(text)) {
        assert.match(text, /NOT EXISTS/);
        assert.match(text, /is_active = TRUE/);
        return {
          rowCount: 1,
          rows: [{ id: SLOT_ID, starts_at: '2030-06-01T08:00:00Z', ends_at: '2030-06-01T08:30:00Z' }],
        };
      }
      throw new Error(`unexpected: ${text}`);
    };
    const res = makeRes();
    await getDoctorAvailability(
      { user: { id: PATIENT_A }, params: { doctorId: DOCTOR_A }, query: { date: '2030-06-01' } },
      res, nextThrows,
    );
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.slots.length, 1);
    assert.equal(res.body.slots[0].display, '09:00 WAT');
    assert.doesNotMatch(JSON.stringify(res.body), /patient|user_id/i);
  });
  test('invalid date -> 422, inactive doctor -> 404', async () => {
    let res = makeRes();
    await getDoctorAvailability(
      { user: { id: PATIENT_A }, params: { doctorId: DOCTOR_A }, query: { date: 'not-a-date' } },
      res, nextThrows,
    );
    assert.equal(res.statusCode, 422);
    pool.query = async (text) => {
      if (/FROM users u/.test(text)) return { rowCount: 0, rows: [] };
      throw new Error('slots must not load for an inactive doctor');
    };
    res = makeRes();
    await getDoctorAvailability(
      { user: { id: PATIENT_A }, params: { doctorId: DOCTOR_A }, query: { date: '2030-06-01' } },
      res, nextThrows,
    );
    assert.equal(res.statusCode, 404);
  });
  test('database failure reaches error handler (500, not leak)', async () => {
    pool.query = async () => { throw new Error('db down'); };
    let caught = null;
    await getDoctorAvailability(
      { user: { id: PATIENT_A }, params: { doctorId: DOCTOR_A }, query: { date: '2030-06-01' } },
      makeRes(), (e) => { caught = e; },
    );
    assert.match(caught.message, /db down/);
  });
});

describe('slot booking safety', () => {
  function slotRow(overrides = {}) {
    return {
      id: SLOT_ID, doctor_id: DOCTOR_A,
      starts_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      ends_at: new Date(Date.now() + 30 * 86400000 + 1800000).toISOString(),
      is_active: true, doctor_role: 'doctor',
      display_name: 'Dr. Real', specialty: 'Cardiology', doctor_active: true,
      ...overrides,
    };
  }
  function stubClient(queries, { slot = slotRow(), held = false, insertFails = null } = {}) {
    const client = {
      release() {},
      query: async (text, params) => {
        queries.push({ text, params });
        if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(text)) return { rowCount: 0, rows: [] };
        if (/FROM doctor_availability_slots/.test(text)) {
          assert.match(text, /FOR UPDATE/);
          return slot ? { rowCount: 1, rows: [slot] } : { rowCount: 0, rows: [] };
        }
        if (/FROM appointments/.test(text)) return held ? { rowCount: 1, rows: [{}] } : { rowCount: 0, rows: [] };
        if (/INSERT INTO appointments/.test(text)) {
          if (insertFails) throw insertFails;
          return { rowCount: 1, rows: [{ id: 'x', user_id: params[1], doctor_id: params[2], slot_id: params[3], provider: params[4], specialty: params[5], reason: params[6], visit_type: params[7], date: params[8], time: params[9], status: 'pending' }] };
        }
        throw new Error(`unexpected: ${text}`);
      },
    };
    pool.connect = async () => client;
  }

  test('inactive/expired/held slots rejected with 409 + rollback', async () => {
    for (const opts of [
      { slot: slotRow({ is_active: false }) },
      { slot: slotRow({ doctor_active: false }) },
      { slot: slotRow({ starts_at: new Date(Date.now() - 3600000).toISOString() }) },
      { held: true },
      { slot: null },
    ]) {
      const queries = [];
      stubClient(queries, opts);
      const res = makeRes();
      await createAppointment({ user: { id: PATIENT_A }, body: { reason: 'Follow-up', visitType: 'video', slotId: SLOT_ID } }, res, nextThrows);
      assert.equal(res.statusCode, 409, JSON.stringify(opts));
      assert.ok(queries.includes(queries.find((q) => q.text === 'ROLLBACK')));
    }
  });
  test('unique-violation on concurrent insert becomes 409 (loser path)', async () => {
    const queries = [];
    const conflict = new Error('duplicate');
    conflict.code = '23505';
    stubClient(queries, {}, { insertFails: conflict });
    const res = makeRes();
    await createAppointment({ user: { id: PATIENT_B }, body: { reason: 'Follow-up', visitType: 'video', slotId: SLOT_ID } }, res, nextThrows);
    assert.equal(res.statusCode, 409);
    assert.match(res.body.message, /just booked/);
  });
  test('transaction rollback on database failure', async () => {
    const queries = [];
    stubClient(queries, {}, { insertFails: new Error('db exploded') });
    let caught = null;
    await createAppointment({ user: { id: PATIENT_A }, body: { reason: 'Follow-up', visitType: 'video', slotId: SLOT_ID } }, makeRes(), (e) => { caught = e; });
    assert.match(caught.message, /db exploded/);
    assert.ok(queries.some((q) => q.text === 'ROLLBACK'));
  });
});

describe('doctor availability management', () => {
  test('publish validates window (422) before DB', async () => {
    pool.connect = async () => { throw new Error('DB must not be touched for invalid input'); };
    pool.query = async () => { throw new Error('DB must not be touched for invalid input'); };
    const res = makeRes();
    await publishAvailability(
      { user: { id: DOCTOR_A, role: 'doctor' }, body: { date: futureDate(), startTime: '09:15', endTime: '10:00' } },
      res, nextThrows,
    );
    assert.equal(res.statusCode, 422);
  });
  test('deactivate refuses booked slots (409) and unknown ids (404/422)', async () => {
    pool.query = async (text) => {
      if (/FROM doctor_availability_slots/.test(text)) return { rowCount: 1, rows: [{ id: SLOT_ID, starts_at: new Date(Date.now() + 86400000).toISOString() }] };
      if (/FROM appointments/.test(text)) return { rowCount: 1, rows: [{}] };
      throw new Error(`unexpected: ${text}`);
    };
    let res = makeRes();
    await deactivateSlot({ user: { id: DOCTOR_A, role: 'doctor' }, params: { id: SLOT_ID } }, res, nextThrows);
    assert.equal(res.statusCode, 409);

    pool.query = async () => ({ rowCount: 0, rows: [] });
    res = makeRes();
    await deactivateSlot({ user: { id: DOCTOR_A, role: 'doctor' }, params: { id: SLOT_ID } }, res, nextThrows);
    assert.equal(res.statusCode, 404);

    res = makeRes();
    await deactivateSlot({ user: { id: DOCTOR_A, role: 'doctor' }, params: { id: 'bad' } }, res, nextThrows);
    assert.equal(res.statusCode, 422);
  });
  test('listMyAvailability scopes to the signed-in doctor', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return { rowCount: 0, rows: [] };
    };
    const res = makeRes();
    await listMyAvailability({ user: { id: DOCTOR_A, role: 'doctor' } }, res, nextThrows);
    assert.deepEqual(queries[0].params, [DOCTOR_A]);
  });
});

describe('migration 003 safety', () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const sql = fs.readFileSync(path.join(currentDir, '../src/db/migrations/003_appointment_scheduling.sql'), 'utf8');
  test('additive: slots table + nullable slot_id, no destructive ops', () => {
    assert.match(sql, /CREATE TABLE IF NOT EXISTS doctor_availability_slots/);
    assert.match(sql, /ADD COLUMN IF NOT EXISTS slot_id/);
    assert.match(sql, /uq_active_slot_booking/);
    assert.match(sql, /30 minutes/);
    assert.doesNotMatch(sql, /DROP TABLE/i);
    assert.doesNotMatch(sql, /DELETE FROM/i);
    assert.doesNotMatch(sql, /TRUNCATE/i);
  });
  test('preserves legacy data: no backfill from provider names', () => {
    assert.doesNotMatch(sql, /UPDATE appointments SET slot_id/i);
    assert.match(sql, /ON DELETE RESTRICT/);
  });
});
