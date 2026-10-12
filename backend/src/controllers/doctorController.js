import { pool } from '../config/db.js';
import { formatDateOnly } from '../utils/validation.js';

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

function toDoctorAppointmentResponse(row) {
  return {
    id: row.id,
    patientName: row.patient_name,
    reason: row.reason,
    visitType: row.visit_type,
    date: formatDateOnly(row.date),
    time: row.time,
    status: row.status,
    specialty: row.specialty,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

// Doctor-only: appointments assigned to the SIGNED-IN doctor. Every query is
// scoped by doctor_id = req.user.id so one doctor can never see another's.
export async function listDoctorAppointments(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS patient_name
       FROM appointments a
       JOIN users u ON u.id = a.user_id
       WHERE a.doctor_id = $1
       ORDER BY a.date ASC, a.created_at ASC`,
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
      `SELECT a.*, u.name AS patient_name
       FROM appointments a
       JOIN users u ON u.id = a.user_id
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

    const row = { ...updated.rows[0], patient_name: owned.rows[0].patient_name };
    return res.json({ appointment: toDoctorAppointmentResponse(row) });
  } catch (error) {
    return next(error);
  }
}
