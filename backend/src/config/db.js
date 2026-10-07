import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (error) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected Postgres pool error:', error.message);
});
