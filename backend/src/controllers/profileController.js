import { pool } from '../config/db.js';
import {
  formatDateOnly,
  validateDateOfBirth,
  validateName,
  validateNotifications,
  validatePhone,
} from '../utils/validation.js';

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

function invalid(message) {
  return { status: 422, body: { message } };
}

// Validate the whole payload before opening a transaction, so bad input never
// starts a write. Each check reports the first problem it finds.
export function validateProfilePayload(body) {
  const payload = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const { name, dateOfBirth, phone, notifications } = payload;

  let trimmedName;
  if (name !== undefined) {
    const result = validateName(name);
    if (!result.ok) return { error: invalid(result.message) };
    trimmedName = result.value;
  }

  const birthDate = validateDateOfBirth(dateOfBirth);
  if (!birthDate.ok) return { error: invalid(birthDate.message) };

  const phoneNumber = validatePhone(phone);
  if (!phoneNumber.ok) return { error: invalid(phoneNumber.message) };

  const notificationResult = validateNotifications(notifications);
  if (!notificationResult.ok) return { error: invalid(notificationResult.message) };

  return {
    value: {
      name: trimmedName,
      dateOfBirth: birthDate.value,
      phone: phoneNumber.value,
      notifications: notificationResult.value,
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
  const validation = validateProfilePayload(req.body);
  if (validation.error) {
    return res.status(validation.error.status).json(validation.error.body);
  }

  const { name: trimmedName, dateOfBirth, phone, notifications } = validation.value;

  let client;
  try {
    client = await pool.connect();
  } catch (error) {
    return next(error);
  }

  try {
    // Both tables are touched by one save, so users and profile must move
    // together — a partial write would leave the header name and the profile
    // record disagreeing.
    await client.query('BEGIN');

    const current = await client.query('SELECT * FROM patient_profiles WHERE user_id = $1', [req.user.id]);
    if (current.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Profile not found.' });
    }
    const existing = current.rows[0];

    if (trimmedName !== undefined) {
      await client.query('UPDATE users SET name = $1, updated_at = now() WHERE id = $2', [
        trimmedName,
        req.user.id,
      ]);
    }

    // Build SET clauses only for the fields that were actually sent, so an
    // omitted field keeps its stored value and an explicit '' still clears it.
    const assignments = [];
    const params = [req.user.id];
    const addAssignment = (column, value, cast = '') => {
      params.push(value);
      assignments.push(`${column} = $${params.length}${cast}`);
    };

    if (dateOfBirth !== undefined) addAssignment('date_of_birth', dateOfBirth, '::date');
    if (phone !== undefined) addAssignment('phone', phone, '::text');

    if (notifications.appointments !== undefined) {
      addAssignment('appointment_reminders', notifications.appointments);
    }
    if (notifications.results !== undefined) {
      addAssignment('test_result_notices', notifications.results);
    }
    if (notifications.billing !== undefined) {
      addAssignment('billing_updates', notifications.billing);
    }

    let updatedRow = existing;

    if (assignments.length > 0) {
      assignments.push('updated_at = now()');
      const updated = await client.query(
        `UPDATE patient_profiles SET ${assignments.join(', ')} WHERE user_id = $1 RETURNING *`,
        params,
      );
      updatedRow = updated.rows[0];
    }

    const userResult = await client.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    await client.query('COMMIT');

    return res.json(toProfileResponse(user, updatedRow));
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // The connection may already be unusable; the original error wins.
    }
    return next(error);
  } finally {
    client.release();
  }
}