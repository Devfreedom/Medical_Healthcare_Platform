import { pool } from '../config/db.js';
import { formatDateOnly, toNullableString } from '../utils/validation.js';

function toProfileResponse(user, profileRow) {
  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      dateOfBirth: formatDateOnly(profileRow.date_of_birth),
      phone: profileRow.phone || '',
      notifications: {
        appointments: profileRow.appointment_reminders,
        results: profileRow.test_result_notices,
        billing: profileRow.billing_updates,
      },
    },
  };
}

export async function getProfile(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1', [req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Profile not found.' });
    }
    return res.json(toProfileResponse(req.user, result.rows[0]));
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, dateOfBirth, phone, notifications } = req.body || {};

    const trimmedName =
      typeof name === 'string' && name.trim().length >= 1 ? name.trim() : null;
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(422).json({ message: 'Name must not be empty.' });
    }

    let birthDate = null;
    if (dateOfBirth !== undefined && dateOfBirth !== '' && dateOfBirth !== null) {
      if (typeof dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        return res.status(422).json({ message: 'Date of birth must be YYYY-MM-DD.' });
      }
      birthDate = dateOfBirth;
    }

    const phoneValue = phone === undefined ? undefined : toNullableString(phone);

    const notif = notifications && typeof notifications === 'object' ? notifications : {};
    const toBool = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

    const current = await pool.query('SELECT * FROM patient_profiles WHERE user_id = $1', [req.user.id]);
    if (current.rowCount === 0) {
      return res.status(404).json({ message: 'Profile not found.' });
    }
    const existing = current.rows[0];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (trimmedName) {
        await client.query('UPDATE users SET name = $1, updated_at = now() WHERE id = $2', [
          trimmedName,
          req.user.id,
        ]);
      }

      const updated = await client.query(
        `UPDATE patient_profiles
         SET date_of_birth = COALESCE($2, date_of_birth),
             phone = CASE WHEN $3 IS DISTINCT FROM '__UNSET__' THEN $3::text ELSE phone END,
             appointment_reminders = $4,
             test_result_notices = $5,
             billing_updates = $6,
             updated_at = now()
         WHERE user_id = $1
         RETURNING *`,
        [
          req.user.id,
          birthDate,
          phoneValue === undefined ? '__UNSET__' : phoneValue,
          toBool(notif.appointments, existing.appointment_reminders),
          toBool(notif.results, existing.test_result_notices),
          toBool(notif.billing, existing.billing_updates),
        ],
      );

      // Allow clearing optional fields explicitly.
      if (dateOfBirth === '' || dateOfBirth === null) {
        await client.query('UPDATE patient_profiles SET date_of_birth = NULL WHERE user_id = $1', [
          req.user.id,
        ]);
        updated.rows[0].date_of_birth = null;
      }
      if (phoneValue === null) {
        await client.query('UPDATE patient_profiles SET phone = NULL WHERE user_id = $1', [req.user.id]);
        updated.rows[0].phone = null;
      }

      await client.query('COMMIT');

      const userResult = await client.query('SELECT id, name, email FROM users WHERE id = $1', [
        req.user.id,
      ]);
      return res.json(toProfileResponse(userResult.rows[0], updated.rows[0]));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return next(error);
  }
}
