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

  // Token verification is the only failure that means "not authenticated".
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  if (!payload || !payload.sub) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  // A database failure here is a server problem, not bad credentials. Let it
  // reach the centralized error handler so it becomes a 500 instead of a 401
  // that would log the user out.
  //
  // The role is read from the database on every request (not from a JWT claim
  // or client state) so revoking or changing a role takes effect immediately.
  let result;
  try {
    result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);
  } catch (error) {
    return next(error);
  }

  // The token verified but the account is gone — the session is no longer valid.
  if (result.rowCount === 0) {
    return res.status(401).json({ message: 'Account not found.' });
  }

  // Everything downstream scopes its records to this user id.
  req.user = result.rows[0];
  return next();
}

// Role gate for doctor/admin-only routes. Must run after requireAuth.
// 401 = no authenticated session; 403 = authenticated but wrong role.
// The role always comes from req.user (database), never from request bodies,
// localStorage, or JWT claims, so clients cannot escalate themselves.
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    return next();
  };
}