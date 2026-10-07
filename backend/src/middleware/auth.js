import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [payload.sub]);

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    req.user = result.rows[0];
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
