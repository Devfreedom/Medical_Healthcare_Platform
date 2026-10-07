import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', db: 'ok' });
  } catch {
    return res.status(503).json({ status: 'degraded', db: 'unreachable' });
  }
});

export default router;
