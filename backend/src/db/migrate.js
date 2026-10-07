import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(currentDir, 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function main() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await client.query('SELECT name FROM schema_migrations');
    const appliedNames = new Set(applied.rows.map((row) => row.name));

    for (const file of files) {
      if (appliedNames.has(file)) {
        // eslint-disable-next-line no-console
        console.log(`skip ${file} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        // eslint-disable-next-line no-console
        console.log(`applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', error.message);
  process.exit(1);
});
