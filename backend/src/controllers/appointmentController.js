import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { formatDateOnly } from '../utils/validation.js';
import {
  formatLagosTime,
  isUuid,
  toLagosDateKey,
} from '../utils/scheduling.js';

const VALID_VISIT_TYPES = ['video', 'in-person'];

export function toAppointmentResponse(row) {
  const startsAt = row.slot_starts_at || row.starts_at || null;
  const endsAt = row.slot_ends_at || row.ends_at || null;
  return {
    id: row.id,
    provider: row.provider,
    specialty: row.specialty,
    reason: row.reason,
    visitType: row.visit_type,
    date: formatDateOnly(row.date),
    time: row.time,
    status: row.status,
    doctorId: row.doctor_id || null,
    slotId: row.slot_id || null,
    startsAt: startsAt ? new Date(startsAt).toISOString() : null,
    endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    scheduledTime: startsAt ? formatLagosTime(startsAt) : null,
  };
}

export async function listAppointments(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT a.*, s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
       FROM appointments a
       LEFT JOIN doctor_availability_slots s ON s.id = a.slot_id
       WHERE a.user_id = $1
       ORDER BY a.date ASC, s.starts_at ASC NULLS LAST, a.created_at ASC`,
      [req.user.id],
    );
    return res.json({ appointments: result.rows.map(toAppointmentResponse) });
  } catch (error) {
    return next(error);
  }
}

// Slot-based booking only: every new appointment must reserve a real slot.
// Provider/specialty/date/time/doctor are derived from the trusted slot +
// doctor records, never from client input.
export async function createAppointment(req, res, next) {
  const client = await pool.connect().catch((error) => next(error));
  if (!client) return undefined;
  // pool.connect stub in unit tests resolves a plain client; if connecting
  // failed, next(error) already ran and client is undefined.
  try {
    const { reason, visitType, slotId } = req.body || {};

    if (!reason || String(reason).trim().length === 0) {
      client.release();
      return res.status(422).json({ message: 'Please choose a reason.' });
    }
    if (!VALID_VISIT_TYPES.includes(visitType)) {
      client.release();
      return res.status(422).json({ message: 'Please choose a visit type.' });
    }
    if (!isUuid(slotId)) {
      client.release();
      return res.status(422).json({ message: 'Please choose an available time slot.' });
    }
    const slotKey = String(slotId).trim();

    await client.query('BEGIN');
    try {
      // Trusted slot + doctor fetch with row lock so two concurrent
      // bookings serialize on the same slot row.
      const slot = await client.query(
        `SELECT s.id, s.doctor_id, s.starts_at, s.ends_at, s.is_active,
                u.role AS doctor_role, d.display_name, d.specialty, d.is_active AS doctor_active
         FROM doctor_availability_slots s
         JOIN users u ON u.id = s.doctor_id
         JOIN doctor_profiles d ON d.user_id = s.doctor_id
         WHERE s.id = $1
         FOR UPDATE OF s`,
        [slotKey],
      );
      if (slot.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'That time slot is no longer available.' });
      }
      const s = slot.rows[0];
      if (
        s.doctor_role !== 'doctor' || s.doctor_active !== true || s.is_active !== true
      ) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'That time slot is no longer available.' });
      }
      if (new Date(s.starts_at).getTime() <= Date.now()) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'That time slot is no longer available.' });
      }

      // Active reservation check (partial unique index is the final guard;
      // this check gives the friendly 409 before hitting it).
      const held = await client.query(
        `SELECT 1 FROM appointments
         WHERE slot_id = $1 AND status IN ('pending', 'confirmed')
         FOR UPDATE`,
        [slotKey],
      );
      if (held.rowCount > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'That time slot was just booked. Please choose another.' });
      }

      const lagosDate = toLagosDateKey(s.starts_at);
      const lagosTime = formatLagosTime(s.starts_at);
      let inserted;
      try {
        inserted = await client.query(
          `INSERT INTO appointments (id, user_id, doctor_id, slot_id, provider, specialty, reason, visit_type, date, time, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
           RETURNING *`,
          [
            randomUUID(),
            req.user.id,
            s.doctor_id,
            slotKey,
            s.display_name,
            s.specialty,
            String(reason).trim(),
            visitType,
            lagosDate,
            lagosTime,
          ],
        );
      } catch (insertError) {
        // Concurrent winner committed first: partial unique index fires.
        if (insertError && insertError.code === '23505') {
          await client.query('ROLLBACK');
          return res.status(409).json({ message: 'That time slot was just booked. Please choose another.' });
        }
        throw insertError;
      }
      await client.query('COMMIT');
      const row = {
        ...inserted.rows[0],
        slot_starts_at: s.starts_at,
        slot_ends_at: s.ends_at,
      };
      return res.status(201).json({ appointment: toAppointmentResponse(row) });
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Rollback best-effort; original error matters.
      }
      return next(error);
    } finally {
      client.release();
    }
  } catch (error) {
    try {
      client.release();
    } catch {
      // ignore
    }
    return next(error);
  }
}
