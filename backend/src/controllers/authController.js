import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import { isValidEmail, validateName } from '../utils/validation.js';

function safeUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    const nameCheck = validateName(name);
    if (!nameCheck.ok) {
      return res.status(422).json({ message: nameCheck.message });
    }
    if (!isValidEmail(email)) {
      return res.status(422).json({ message: 'Enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(422).json({ message: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = nameCheck.value;
    const passwordHash = await bcrypt.hash(password, 12);

    const userId = randomUUID();
    const conversationId = randomUUID();
    const messageId = randomUUID();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existing.rowCount > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }

      const userResult = await client.query(
        'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [userId, trimmedName, normalizedEmail, passwordHash],
      );

      await client.query('INSERT INTO patient_profiles (user_id) VALUES ($1)', [userId]);

      await client.query('INSERT INTO conversations (id, user_id, name) VALUES ($1, $2, $3)', [
        conversationId,
        userId,
        'Clinic Front Desk',
      ]);

      await client.query(
        'INSERT INTO messages (id, conversation_id, sender_type, body) VALUES ($1, $2, $3, $4)',
        [messageId, conversationId, 'them', 'Welcome to Northbridge Health. Your account is ready.'],
      );

      await client.query('COMMIT');

      const user = safeUser(userResult.rows[0]);
      return res.status(201).json({ token: signToken(user.id), user });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        return res.status(409).json({ message: 'An account with that email already exists.' });
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [
      normalizedEmail,
    ]);

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const row = result.rows[0];
    const matches = await bcrypt.compare(password, row.password_hash);
    if (!matches) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const user = safeUser(row);
    return res.json({ token: signToken(user.id), user });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
}
