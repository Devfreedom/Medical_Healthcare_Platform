import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { isFutureDate } from '../utils/validation.js';

const VALID_VISIT_TYPES = ['video', 'in-person'];

function toAppointmentResponse(row) {
  return {
    id: row.id,
    provider: row.provider,
    specialty: row.specialty,
    reason: row.reason,
    visitType: row.visit_type,
    date: new Date(row.date).toISOString().slice(0, 10),
    time: row.time,
    status: row.status,
  };
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
    const { reason, provider, specialty, visitType, date } = req.body || {};

    if (!reason || String(reason).trim().length === 0) {
      return res.status(422).json({ message: 'Please choose a reason.' });
    }
    if (!provider || String(provider).trim().length === 0) {
      return res.status(422).json({ message: 'Please choose a provider.' });
    }
    if (!VALID_VISIT_TYPES.includes(visitType)) {
      return res.status(422).json({ message: 'Please choose a visit type.' });
    }
    if (!isFutureDate(date)) {
      return res.status(422).json({ message: 'Please choose a future date.' });
    }

    const result = await pool.query(
      `INSERT INTO appointments (id, user_id, provider, specialty, reason, visit_type, date, time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'To be confirmed', 'pending')
       RETURNING *`,
      [
        randomUUID(),
        req.user.id,
        String(provider).trim(),
        specialty && String(specialty).trim() ? String(specialty).trim() : 'Primary Care',
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
