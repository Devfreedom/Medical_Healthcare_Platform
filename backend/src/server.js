import app from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';

async function main() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Cannot reach PostgreSQL. Check DATABASE_URL and that Postgres is running.');
    process.exit(1);
  }

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Northbridge Health API listening on port ${env.port}`);
  });
}

main();
