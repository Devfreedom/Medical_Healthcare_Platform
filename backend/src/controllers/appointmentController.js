import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { formatDateOnly, isFutureDate } from '../utils/validation.js';

const VALID_VISIT_TYPES = ['video', 'in-person'];

function toAppointmentResponse(row) {
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
  };
}

function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim())
  );
}

export async function listAppointments(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE user_id = $1 ORDER BY date ASC, created_at ASC',
      [req.user.id],
    );
    return res.json({ appointments: result.rows.map(toAppointmentResponse) });
  } catch (error) {
    return next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const { reason, provider, specialty, visitType, date, doctorId } = req.body || {};

    if (!reason || String(reason).trim().length === 0) {
      return res.status(422).json({ message: 'Please choose a reason.' });
    }
    if (!VALID_VISIT_TYPES.includes(visitType)) {
      return res.status(422).json({ message: 'Please choose a visit type.' });
    }
    if (!isFutureDate(date)) {
      return res.status(422).json({ message: 'Please choose a future date.' });
    }

    // When a doctor is selected, it must be a real active doctor record.
    // Provider/specialty display text then comes from that record, not from
    // client input, so a crafted request cannot spoof another clinician.
    let assignedDoctorId = null;
    let displayProvider = provider;
    let displaySpecialty = specialty;
    if (doctorId !== undefined && doctorId !== null && String(doctorId).trim() !== '') {
      if (!isUuid(doctorId)) {
        return res.status(422).json({ message: 'Please choose a doctor.' });
      }
      const doctor = await pool.query(
        `SELECT u.id, d.display_name, d.specialty
         FROM users u
         JOIN doctor_profiles d ON d.user_id = u.id
         WHERE u.id = $1 AND u.role = 'doctor' AND d.is_active = TRUE`,
        [String(doctorId).trim()],
      );
      if (doctor.rowCount === 0) {
        return res.status(422).json({ message: 'The selected doctor is not available.' });
      }
      assignedDoctorId = doctor.rows[0].id;
      displayProvider = doctor.rows[0].display_name;
      displaySpecialty = doctor.rows[0].specialty;
    }

    // Legacy path (no doctor selected): keep accepting free-text provider so
    // requests created before the doctor directory stay submittable.
    if (!assignedDoctorId && (!displayProvider || String(displayProvider).trim().length === 0)) {
      return res.status(422).json({ message: 'Please choose a provider.' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (id, user_id, doctor_id, provider, specialty, reason, visit_type, date, time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'To be confirmed', 'pending')
       RETURNING *`,
      [
        randomUUID(),
        req.user.id,
        assignedDoctorId,
        String(displayProvider).trim(),
        displaySpecialty && String(displaySpecialty).trim() ? String(displaySpecialty).trim() : 'Primary Care',
        String(reason).trim(),
        visitType,
        date,
      ],
    );

    return res.status(201).json({ appointment: toAppointmentResponse(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}
