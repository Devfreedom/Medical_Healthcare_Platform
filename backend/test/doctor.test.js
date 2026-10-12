// Doctor-role MVP tests. All database access is stubbed: `pool.query` and
// `pool.connect` are replaced per test, so no database is contacted, no
// production data is read or written, and the provisioning utility is only
// exercised through its exported functions (its CLI entrypoint never runs
// under the test runner).
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://stub:stub@localhost:5432/stub';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-used-anywhere-real';
process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after, describe } from 'node:test';

const { requireRole } = await import('../src/middleware/auth.js');
const { register } = await import('../src/controllers/authController.js');
const {
  createAppointment,
  listAppointments,
} = await import('../src/controllers/appointmentController.js');
const {
  listDoctors,
  listDoctorAppointments,
  transitionDoctorAppointment,
} = await import('../src/controllers/doctorController.js');
const {
  parseProvisionArgs,
  provisioningGuard,
  provisionDoctor,
  validateProvisionInput,
} = await import('../scripts/provision-doctor.js');
const { pool } = await import('../src/config/db.js');

const originalQuery = pool.query;
const originalConnect = pool.connect;

after(() => {
  pool.query = originalQuery;
  pool.connect = originalConnect;
});

const PATIENT_ID = '11111111-1111-1111-1111-111111111111';
const DOCTOR_A_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DOCTOR_B_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const APPT_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

// Express sends 200 when json() is called without an explicit status.
function makeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function stubClient(queries, handler) {
  const client = {
    release() {},
    query: async (text, params) => {
      queries.push({ text, params });
      if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return { rowCount: 0, rows: [] };
      return handler(text, params, queries.length);
    },
  };
  pool.connect = async () => client;
}

describe('requireRole', () => {
  test('returns 401 when there is no authenticated user', async () => {
    const res = makeRes();
    let nextCalled = false;
    await requireRole('doctor')({}, res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  test('returns 403 when a patient hits a doctor-only route', async () => {
    const res = makeRes();
    let nextCalled = false;
    await requireRole('doctor')({ user: { id: PATIENT_ID, role: 'patient' } }, res, () => {
      nextCalled = true;
    });
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.message, 'Access denied.');
    assert.equal(nextCalled, false);
  });

  test('passes a doctor through', async () => {
    const res = makeRes();
    let nextCalled = false;
    await requireRole('doctor')({ user: { id: DOCTOR_A_ID, role: 'doctor' } }, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
  });
});

describe('public registration cannot mint doctors', () => {
  test('ignores role:"doctor" in the request body', async () => {
    const queries = [];
    stubClient(queries, (text) => {
      if (/SELECT id FROM users WHERE email/.test(text)) return { rowCount: 0, rows: [] };
      if (/INSERT INTO users/.test(text)) {
        return {
          rowCount: 1,
          rows: [{ id: PATIENT_ID, name: 'Eve', email: 'eve@example.com', role: 'patient' }],
        };
      }
      return { rowCount: 0, rows: [] };
    });

    const res = makeRes();
    await register(
      { body: { name: 'Eve', email: 'eve@example.com', password: 'password123', role: 'doctor' } },
      res,
      (error) => { throw error; },
    );

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.user.role, 'patient');
    const insert = queries.find((q) => /INSERT INTO users/.test(q.text));
    assert.match(insert.text, /'patient'/);
    assert.doesNotMatch(insert.text, /\$5/);
  });
});

describe('doctor appointment isolation', () => {
  test('lists only the signed-in doctor assignments', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return { rowCount: 0, rows: [] };
    };

    const res = makeRes();
    await listDoctorAppointments({ user: { id: DOCTOR_A_ID, role: 'doctor' } }, res, (e) => { throw e; });

    assert.equal(res.statusCode, 200);
    assert.match(queries[0].text, /WHERE a\.doctor_id = \$1/);
    assert.deepEqual(queries[0].params, [DOCTOR_A_ID]);
  });

  test('doctor A cannot transition doctor B appointments (404, no leak)', async () => {
    pool.query = async (text) => {
      if (/^SELECT a\.\*/.test(text)) return { rowCount: 0, rows: [] };
      throw new Error('no further queries allowed after a failed ownership check');
    };

    const res = makeRes();
    await transitionDoctorAppointment(
      { user: { id: DOCTOR_A_ID, role: 'doctor' }, params: { id: APPT_ID }, body: { status: 'confirmed' } },
      res,
      (e) => { throw e; },
    );

    assert.equal(res.statusCode, 404);
    assert.doesNotMatch(JSON.stringify(res.body), /SELECT|doctor_id/i);
  });

  test('accepts pending -> confirmed for the owning doctor', async () => {
    const owned = {
      id: APPT_ID,
      user_id: PATIENT_ID,
      doctor_id: DOCTOR_A_ID,
      provider: 'Dr. A',
      specialty: 'Cardiology',
      reason: 'Follow-up',
      visit_type: 'video',
      date: '2030-01-15',
      time: 'To be confirmed',
      status: 'pending',
      created_at: new Date().toISOString(),
      patient_name: 'Pat',
    };
    pool.query = async (text) => {
      if (/^SELECT a\.\*/.test(text)) return { rowCount: 1, rows: [owned] };
      if (/^UPDATE appointments/.test(text)) {
        assert.match(text, /AND status = 'pending'/);
        return { rowCount: 1, rows: [{ ...owned, status: 'confirmed' }] };
      }
      throw new Error(`unexpected query: ${text}`);
    };

    const res = makeRes();
    await transitionDoctorAppointment(
      { user: { id: DOCTOR_A_ID, role: 'doctor' }, params: { id: APPT_ID }, body: { status: 'confirmed' } },
      res,
      (e) => { throw e; },
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.appointment.status, 'confirmed');
    assert.equal(res.body.appointment.patientName, 'Pat');
  });

  test('accepts pending -> rejected for the owning doctor', async () => {
    const owned = {
      id: APPT_ID, user_id: PATIENT_ID, doctor_id: DOCTOR_A_ID, provider: 'Dr. A',
      specialty: 'Cardiology', reason: 'Follow-up', visit_type: 'video',
      date: '2030-01-15', time: 'To be confirmed', status: 'pending',
      created_at: new Date().toISOString(), patient_name: 'Pat',
    };
    pool.query = async (text) => {
      if (/^SELECT a\.\*/.test(text)) return { rowCount: 1, rows: [owned] };
      return { rowCount: 1, rows: [{ ...owned, status: 'rejected' }] };
    };

    const res = makeRes();
    await transitionDoctorAppointment(
      { user: { id: DOCTOR_A_ID, role: 'doctor' }, params: { id: APPT_ID }, body: { status: 'rejected' } },
      res,
      (e) => { throw e; },
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.appointment.status, 'rejected');
  });

  test('rejects arbitrary target statuses with 422', async () => {
    for (const status of ['completed', 'cancelled', 'pending', '', null, 42]) {
      pool.query = async () => { throw new Error('DB must not be touched for invalid input'); };
      const res = makeRes();
      await transitionDoctorAppointment(
        { user: { id: DOCTOR_A_ID, role: 'doctor' }, params: { id: APPT_ID }, body: { status } },
        res,
        (e) => { throw e; },
      );
      assert.equal(res.statusCode, 422, `${JSON.stringify(status)} should be rejected`);
    }
  });

  test('refuses to re-transition a decided request with 409', async () => {
    const owned = {
      id: APPT_ID, user_id: PATIENT_ID, doctor_id: DOCTOR_A_ID, provider: 'Dr. A',
      specialty: 'Cardiology', reason: 'Follow-up', visit_type: 'video',
      date: '2030-01-15', time: 'To be confirmed', status: 'confirmed',
      created_at: new Date().toISOString(), patient_name: 'Pat',
    };
    pool.query = async (text) => {
      if (/^SELECT a\.\*/.test(text)) return { rowCount: 1, rows: [owned] };
      throw new Error('UPDATE must not run for a non-pending request');
    };

    const res = makeRes();
    await transitionDoctorAppointment(
      { user: { id: DOCTOR_A_ID, role: 'doctor' }, params: { id: APPT_ID }, body: { status: 'rejected' } },
      res,
      (e) => { throw e; },
    );

    assert.equal(res.statusCode, 409);
  });
});

describe('appointment booking against the doctor directory', () => {
  const SLOT_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const slotStartsAt = '2030-06-01T08:00:00.000Z'; // 09:00 WAT
  const slotEndsAt = '2030-06-01T08:30:00.000Z';

  function stubBookingClient(queries, slotRow, onInsert) {
    const client = {
      release() {},
      query: async (text, params) => {
        queries.push({ text, params });
        if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return { rowCount: 0, rows: [] };
        if (/FROM doctor_availability_slots s/.test(text)) {
          return slotRow ? { rowCount: 1, rows: [slotRow] } : { rowCount: 0, rows: [] };
        }
        if (/FROM appointments\s*\n?\s*WHERE slot_id/.test(text)) return { rowCount: 0, rows: [] };
        if (/INSERT INTO appointments/.test(text)) return onInsert(params);
        throw new Error(`unexpected query: ${text}`);
      },
    };
    pool.connect = async () => client;
  }

  function realSlotRow() {
    return {
      id: SLOT_ID,
      doctor_id: DOCTOR_A_ID,
      starts_at: slotStartsAt,
      ends_at: slotEndsAt,
      is_active: true,
      doctor_role: 'doctor',
      display_name: 'Dr. Real',
      specialty: 'Cardiology',
      doctor_active: true,
    };
  }

  test('bookings without a slot are rejected (422, no legacy fallback)', async () => {
    pool.connect = async () => { throw new Error('DB must not be touched without a slot'); };
    const res = makeRes();
    await createAppointment(
      {
        user: { id: PATIENT_ID, role: 'patient' },
        body: { reason: 'Follow-up', visitType: 'video', provider: 'Dr. Amara Odum', date: '2030-06-01' },
      },
      res,
      (e) => { throw e; },
    );
    assert.equal(res.statusCode, 422);
  });

  test('malformed slot ids are rejected without a DB lookup', async () => {
    pool.connect = async () => { throw new Error('DB must not be touched for a malformed id'); };
    const res = makeRes();
    await createAppointment(
      {
        user: { id: PATIENT_ID, role: 'patient' },
        body: { reason: 'Follow-up', visitType: 'video', slotId: 'not-a-uuid' },
      },
      res,
      (e) => { throw e; },
    );
    assert.equal(res.statusCode, 422);
  });

  test('stores the request with the verified slot record (display text from DB)', async () => {
    const queries = [];
    stubBookingClient(queries, realSlotRow(), (params) => {
      const [, userId, doctorId, slotId, provider, specialty, reason, visitType, date, time] = params;
      return {
        rowCount: 1,
        rows: [{
          id: APPT_ID, user_id: userId, doctor_id: doctorId, slot_id: slotId, provider, specialty,
          reason, visit_type: visitType, date, time, status: 'pending',
        }],
      };
    });

    const res = makeRes();
    await createAppointment(
      {
        user: { id: PATIENT_ID, role: 'patient' },
        // Spoofed display text/date/doctor must be overridden by the slot record.
        body: { reason: 'Follow-up', visitType: 'video', slotId: SLOT_ID, provider: 'Dr. Impostor', specialty: 'Fake', doctorId: DOCTOR_B_ID, date: '2030-01-01', time: '10:00' },
      },
      res,
      (e) => { throw e; },
    );

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.appointment.doctorId, DOCTOR_A_ID);
    assert.equal(res.body.appointment.slotId, SLOT_ID);
    assert.equal(res.body.appointment.provider, 'Dr. Real');
    assert.equal(res.body.appointment.specialty, 'Cardiology');
    assert.equal(res.body.appointment.date, '2030-06-01');
    assert.equal(res.body.appointment.scheduledTime, '09:00 WAT');
    assert.ok(queries.some((q) => q.text === 'BEGIN'));
    assert.ok(queries.some((q) => q.text === 'COMMIT'));
  });

  test('unknown slots are rejected with 409 and rolled back', async () => {
    const queries = [];
    stubBookingClient(queries, null, () => { throw new Error('INSERT must not run for an unknown slot'); });
    const res = makeRes();
    await createAppointment(
      { user: { id: PATIENT_ID, role: 'patient' }, body: { reason: 'Follow-up', visitType: 'video', slotId: SLOT_ID } },
      res,
      (e) => { throw e; },
    );
    assert.equal(res.statusCode, 409);
    assert.ok(queries.some((q) => q.text === 'ROLLBACK'));
  });

  test('patients still list only their own appointments after status changes', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return {
        rowCount: 2,
        rows: [
          {
            id: APPT_ID, user_id: PATIENT_ID, doctor_id: DOCTOR_A_ID, slot_id: SLOT_ID, provider: 'Dr. Real',
            specialty: 'Cardiology', reason: 'Follow-up', visit_type: 'video',
            date: '2030-06-01', time: '09:00 WAT', status: 'confirmed',
            slot_starts_at: slotStartsAt, slot_ends_at: slotEndsAt,
          },
          {
            id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', user_id: PATIENT_ID, doctor_id: null, slot_id: null,
            provider: 'Dr. Amara Odum', specialty: 'Primary Care', reason: 'New concern',
            visit_type: 'in-person', date: '2030-06-01', time: 'To be confirmed', status: 'pending',
            slot_starts_at: null, slot_ends_at: null,
          },
        ],
      };
    };

    const res = makeRes();
    await listAppointments({ user: { id: PATIENT_ID, role: 'patient' } }, res, (e) => { throw e; });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.appointments.length, 2);
    // Slotted row shows its real time; legacy row keeps "To be confirmed".
    assert.equal(res.body.appointments[0].scheduledTime, '09:00 WAT');
    assert.equal(res.body.appointments[1].time, 'To be confirmed');
    assert.match(queries[0].text, /WHERE a\.user_id = \$1/);
    assert.deepEqual(queries[0].params, [PATIENT_ID]);
  });
});

describe('doctor directory', () => {
  test('lists only active doctors with display fields', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return { rowCount: 0, rows: [] };
    };

    const res = makeRes();
    await listDoctors({ user: { id: PATIENT_ID, role: 'patient' } }, res, (e) => { throw e; });

    assert.equal(res.statusCode, 200);
    assert.match(queries[0].text, /u\.role = 'doctor' AND d\.is_active = TRUE/);
  });
});

describe('provisioning utility', () => {
  test('refuses to run under NODE_ENV=test', () => {
    assert.match(provisioningGuard({ nodeEnv: 'test' }), /Refusing/);
  });

  test('refuses production without an explicit flag', () => {
    assert.match(provisioningGuard({ nodeEnv: 'production', allowProduction: false }), /--allow-production/);
    assert.equal(provisioningGuard({ nodeEnv: 'production', allowProduction: true }), null);
    assert.equal(provisioningGuard({ nodeEnv: 'development', allowProduction: false }), null);
  });

  test('validates input before touching the database', async () => {
    assert.equal(validateProvisionInput({ name: 'x', email: 'd@example.com', password: 'password123' }).ok, false);
    assert.equal(validateProvisionInput({ name: 'Dr. D', email: 'not-an-email', password: 'password123' }).ok, false);
    assert.equal(validateProvisionInput({ name: 'Dr. D', email: 'd@example.com', password: 'short' }).ok, false);
    const good = validateProvisionInput({ name: '  Dr. D  ', email: ' D@Example.com ', password: 'password123', specialty: '' });
    assert.equal(good.ok, true);
    assert.deepEqual(good.value, { name: 'Dr. D', email: 'd@example.com', specialty: 'Primary Care' });
  });

  test('creates user + profile transactionally and never returns secrets', async () => {
    const queries = [];
    const { default: bcrypt } = await import('bcryptjs');
    stubClient(queries, (text) => {
      if (/SELECT id, role FROM users WHERE email/.test(text)) return { rowCount: 0, rows: [] };
      if (/INSERT INTO users/.test(text)) return { rowCount: 1, rows: [] };
      if (/INSERT INTO doctor_profiles/.test(text)) return { rowCount: 1, rows: [] };
      throw new Error(`unexpected query: ${text}`);
    });

    const created = await provisionDoctor(pool, {
      name: 'Dr. Test',
      email: 'drtest@example.com',
      password: 's3cure-password',
      specialty: 'Cardiology',
    });

    const texts = queries.map((q) => q.text);
    assert.equal(texts[0], 'BEGIN');
    assert.match(texts[1], /SELECT id, role FROM users WHERE email/);
    assert.match(texts[2], /INSERT INTO users.*"role".*'doctor'|INSERT INTO users.*'doctor'/);
    assert.match(texts[3], /INSERT INTO doctor_profiles/);
    assert.equal(texts[texts.length - 1], 'COMMIT');
    assert.equal(created.role, 'doctor');

    // The hash stored must verify, and no secret may be returned or logged.
    const hashParam = queries.find((q) => /INSERT INTO users/.test(q.text)).params[3];
    assert.equal(await bcrypt.compare('s3cure-password', hashParam), true);
    assert.doesNotMatch(JSON.stringify(created), /s3cure-password/);
    assert.equal(created.password, undefined);
    assert.equal(created.passwordHash, undefined);
  });

  test('refuses to promote an existing account and rolls back', async () => {
    const queries = [];
    stubClient(queries, (text) => {
      if (/SELECT id, role FROM users WHERE email/.test(text)) {
        return { rowCount: 1, rows: [{ id: PATIENT_ID, role: 'patient' }] };
      }
      return { rowCount: 0, rows: [] };
    });

    await assert.rejects(
      () => provisionDoctor(pool, { name: 'Dr. Dup', email: 'dup@example.com', password: 'password123' }),
      /never promoted/,
    );
    assert.ok(queries.some((q) => q.text === 'ROLLBACK'));
    assert.ok(!queries.some((q) => /INSERT INTO/.test(q.text)));
  });

  test('parses CLI args without ever accepting a password flag', () => {
    const args = parseProvisionArgs(['--name', 'Dr. X', '--email', 'x@example.com', '--specialty', 'Dermatology']);
    assert.deepEqual(args, { name: 'Dr. X', email: 'x@example.com', specialty: 'Dermatology', allowProduction: false });
    assert.equal('password' in args, false);
  });
});

describe('migration 002 safety', () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const sql = fs.readFileSync(path.join(currentDir, '../src/db/migrations/002_doctor_role.sql'), 'utf8');

  test('is additive: no table drops, deletes, or truncates', () => {
    assert.doesNotMatch(sql, /DROP TABLE/i);
    assert.doesNotMatch(sql, /DELETE FROM/i);
    assert.doesNotMatch(sql, /TRUNCATE/i);
    assert.doesNotMatch(sql, /ALTER TABLE appointments DROP COLUMN/i);
  });

  test('defaults existing users to patient and keeps legacy appointments unassigned', () => {
    assert.match(sql, /DEFAULT 'patient'/);
    assert.match(sql, /doctor_id UUID NULL/);
    assert.doesNotMatch(sql, /UPDATE appointments SET doctor_id/i);
  });
});
