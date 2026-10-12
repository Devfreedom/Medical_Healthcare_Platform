import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { formatDateOnly, isValidDateString } from '../utils/validation.js';
import {
  formatLagosTime,
  isUuid,
  lagosDayBoundsUTC,
  toLagosDateKey,
  validateAvailabilityWindow,
} from '../utils/scheduling.js';

// Public directory of active doctors for the patient booking flow.
// Authenticated (any role): contains only display name + specialty, no PHI.
export async function listDoctors(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT u.id, d.display_name, d.specialty
       FROM users u
       JOIN doctor_profiles d ON d.user_id = u.id
       WHERE u.role = 'doctor' AND d.is_active = TRUE
       ORDER BY d.display_name ASC`,
    );
    return res.json({
      doctors: result.rows.map((row) => ({
        id: row.id,
        displayName: row.display_name,
        specialty: row.specialty,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

// Patient-facing availability: open 30-min slots for one doctor + Lagos date.
// Returns slot ids + times only; never other patients' information.
export async function getDoctorAvailability(req, res, next) {
  try {
    const doctorId = String(req.params.doctorId || '').trim();
    const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';

    if (!isUuid(doctorId)) {
      return res.status(422).json({ message: 'Please choose a doctor.' });
    }
    if (!isValidDateString(date)) {
      return res.status(422).json({ message: 'Choose a valid date (YYYY-MM-DD).' });
    }
    const bounds = lagosDayBoundsUTC(date);
    if (!bounds) {
      return res.status(422).json({ message: 'Choose a valid date (YYYY-MM-DD).' });
    }

    const doctor = await pool.query(
      `SELECT u.id FROM users u
       JOIN doctor_profiles d ON d.user_id = u.id
       WHERE u.id = $1 AND u.role = 'doctor' AND d.is_active = TRUE`,
      [doctorId],
    );
    if (doctor.rowCount === 0) {
      return res.status(404).json({ message: 'Doctor not found or unavailable.' });
    }

    const slots = await pool.query(
      `SELECT s.id, s.starts_at, s.ends_at
       FROM doctor_availability_slots s
       WHERE s.doctor_id = $1
         AND s.is_active = TRUE
         AND s.starts_at >= $2 AND s.starts_at < $3
         AND s.starts_at > now()
         AND NOT EXISTS (
           SELECT 1 FROM appointments a
           WHERE a.slot_id = s.id AND a.status IN ('pending', 'confirmed')
         )
       ORDER BY s.starts_at ASC`,
      [doctorId, bounds.start.toISOString(), bounds.end.toISOString()],
    );

    return res.json({
      doctorId,
      date,
      slots: slots.rows.map((row) => ({
        id: row.id,
        startsAt: new Date(row.starts_at).toISOString(),
        endsAt: new Date(row.ends_at).toISOString(),
        display: formatLagosTime(row.starts_at),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

function toDoctorAppointmentResponse(row) {
  const startsAt = row.slot_starts_at || null;
  const endsAt = row.slot_ends_at || null;
  return {
    id: row.id,
    patientName: row.patient_name,
    reason: row.reason,
    visitType: row.visit_type,
    date: formatDateOnly(row.date),
    time: row.time,
    status: row.status,
    specialty: row.specialty,
    slotId: row.slot_id || null,
    startsAt: startsAt ? new Date(startsAt).toISOString() : null,
    endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    scheduledTime: startsAt ? formatLagosTime(startsAt) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

function toSlotResponse(row) {
  return {
    id: row.id,
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: new Date(row.ends_at).toISOString(),
    date: toLagosDateKey(row.starts_at),
    display: formatLagosTime(row.starts_at),
    isActive: row.is_active,
  };
}

// Doctor-only: appointments assigned to the SIGNED-IN doctor. Every query is
// scoped by doctor_id = req.user.id so one doctor can never see another's.
export async function listDoctorAppointments(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS patient_name,
              s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
       FROM appointments a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN doctor_availability_slots s ON s.id = a.slot_id
       WHERE a.doctor_id = $1
       ORDER BY a.date ASC, s.starts_at ASC NULLS LAST, a.created_at ASC`,
      [req.user.id],
    );
    return res.json({ appointments: result.rows.map(toDoctorAppointmentResponse) });
  } catch (error) {
    return next(error);
  }
}

const VALID_TRANSITIONS = ['confirmed', 'rejected'];

// Doctor-only: confirm or reject ONE pending request assigned to the
// signed-in doctor. Anything else (unknown id, another doctor's row,
// non-pending status, other target status) is refused.
export async function transitionDoctorAppointment(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!VALID_TRANSITIONS.includes(status)) {
      return res.status(422).json({ message: 'Choose confirmed or rejected.' });
    }

    // Ownership first: a row belonging to another doctor (or nobody) is a
    // 404, which reveals nothing about its existence or status.
    const owned = await pool.query(
      `SELECT a.*, u.name AS patient_name,
              s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
       FROM appointments a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN doctor_availability_slots s ON s.id = a.slot_id
       WHERE a.id = $1 AND a.doctor_id = $2`,
      [req.params.id, req.user.id],
    );
    if (owned.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    if (owned.rows[0].status !== 'pending') {
      return res.status(409).json({ message: 'Only pending requests can be confirmed or rejected.' });
    }

    const updated = await pool.query(
      `UPDATE appointments SET status = $1, updated_at = now()
       WHERE id = $2 AND doctor_id = $3 AND status = 'pending'
       RETURNING *`,
      [status, req.params.id, req.user.id],
    );
    if (updated.rowCount === 0) {
      return res.status(409).json({ message: 'Only pending requests can be confirmed or rejected.' });
    }

    const row = {
      ...updated.rows[0],
      patient_name: owned.rows[0].patient_name,
      slot_starts_at: owned.rows[0].slot_starts_at,
      slot_ends_at: owned.rows[0].slot_ends_at,
    };
    return res.json({ appointment: toDoctorAppointmentResponse(row) });
  } catch (error) {
    return next(error);
  }
}

// --- Doctor availability management (doctor-only, self-scoped) ---

async function assertDoctorActive(doctorId) {
  const result = await pool.query(
    `SELECT 1 FROM doctor_profiles WHERE user_id = $1 AND is_active = TRUE`,
    [doctorId],
  );
  return result.rowCount > 0;
}

export async function listMyAvailability(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, starts_at, ends_at, is_active
       FROM doctor_availability_slots
       WHERE doctor_id = $1
       ORDER BY starts_at ASC`,
      [req.user.id],
    );
    return res.json({ slots: result.rows.map(toSlotResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function publishAvailability(req, res, next) {
  try {
    const checked = validateAvailabilityWindow(req.body || {});
    if (!checked.ok) {
      return res.status(422).json({ message: checked.message });
    }
    if (!(await assertDoctorActive(req.user.id))) {
      return res.status(403).json({ message: 'Inactive doctors cannot publish availability.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const created = [];
      for (const slot of checked.value.slots) {
        const inserted = await client.query(
          `INSERT INTO doctor_availability_slots (id, doctor_id, starts_at, ends_at, is_active)
           VALUES ($1, $2, $3, $4, TRUE)
           ON CONFLICT (doctor_id, starts_at) DO NOTHING
           RETURNING *`,
          [randomUUID(), req.user.id, slot.startsAt.toISOString(), slot.endsAt.toISOString()],
        );
        if (inserted.rowCount > 0) created.push(toSlotResponse(inserted.rows[0]));
      }
      await client.query('COMMIT');
      if (created.length === 0) {
        return res.status(409).json({ message: 'Those slots already exist for this date.' });
      }
      return res.status(201).json({ slots: created });
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // best-effort
      }
      return next(error);
    } finally {
      client.release();
    }
  } catch (error) {
    return next(error);
  }
}

export async function deactivateSlot(req, res, next) {
  try {
    const slotId = String(req.params.id || '').trim();
    if (!isUuid(slotId)) {
      return res.status(422).json({ message: 'Unknown time slot.' });
    }

    // Self-scoped: only the owning doctor's future slot.
    const owned = await pool.query(
      `SELECT id, starts_at FROM doctor_availability_slots
       WHERE id = $1 AND doctor_id = $2`,
      [slotId, req.user.id],
    );
    if (owned.rowCount === 0) {
      return res.status(404).json({ message: 'Time slot not found.' });
    }
    if (new Date(owned.rows[0].starts_at).getTime() <= Date.now()) {
      return res.status(409).json({ message: 'Past slots cannot be changed.' });
    }

    const held = await pool.query(
      `SELECT 1 FROM appointments
       WHERE slot_id = $1 AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [slotId],
    );
    if (held.rowCount > 0) {
      return res.status(409).json({ message: 'This slot has a booking and cannot be withdrawn.' });
    }

    const updated = await pool.query(
      `UPDATE doctor_availability_slots SET is_active = FALSE
       WHERE id = $1 AND doctor_id = $2 AND is_active = TRUE
       RETURNING *`,
      [slotId, req.user.id],
    );
    if (updated.rowCount === 0) {
      return res.status(409).json({ message: 'This slot is already inactive.' });
    }
    return res.json({ slot: toSlotResponse(updated.rows[0]) });
  } catch (error) {
    return next(error);
  }
}
