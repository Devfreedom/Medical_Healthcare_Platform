// One-time trusted operator utility: provision a doctor account.
//
// Usage (operator machine with the backend .env present; never on a test DB):
//   node scripts/provision-doctor.js --name "Dr. Jane Doe" --email jane@example.com --specialty Cardiology
//   # password is read securely from stdin (never passed as an argument,
//   # never logged, never stored in source code)
//
// Safety rules:
// - Connects only to DATABASE_URL from the environment. Refuses to run with
//   NODE_ENV=production unless --allow-production is also given, and refuses
//   to run with NODE_ENV=test so automated tests can never create accounts.
// - Creates users(role='doctor') + doctor_profiles in one transaction.
// - Rejects duplicate emails and refuses to promote an existing account
//   (patient or doctor): the operator must pick an unused email.
// - There is intentionally NO public API endpoint for doctor registration.
import { randomUUID } from 'node:crypto';
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';
import { isValidEmail, validateName } from '../src/utils/validation.js';

export function parseProvisionArgs(argv) {
  const args = { name: null, email: null, specialty: 'Primary Care', allowProduction: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === '--name') args.name = argv[(i += 1)];
    else if (flag === '--email') args.email = argv[(i += 1)];
    else if (flag === '--specialty') args.specialty = argv[(i += 1)];
    else if (flag === '--allow-production') args.allowProduction = true;
  }
  return args;
}

export function validateProvisionInput({ name, email, password, specialty }) {
  const nameCheck = validateName(name);
  if (!nameCheck.ok) return { ok: false, message: nameCheck.message };
  if (!isValidEmail(email)) return { ok: false, message: 'Enter a valid email address.' };
  if (typeof password !== 'string' || password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters.' };
  }
  if (specialty !== undefined && specialty !== null && String(specialty).trim().length === 0) {
    return { ok: false, message: 'Specialty must not be empty.' };
  }
  return {
    ok: true,
    value: {
      name: nameCheck.value,
      email: email.trim().toLowerCase(),
      specialty:
        specialty && String(specialty).trim() ? String(specialty).trim() : 'Primary Care',
    },
  };
}

// Guardrail: returns an error message when this environment must not be
// touched, or null when provisioning may proceed.
export function provisioningGuard({ nodeEnv, allowProduction }) {
  if (nodeEnv === 'test') {
    return 'Refusing to provision while NODE_ENV=test. Automated tests must never create real accounts.';
  }
  if (nodeEnv === 'production' && !allowProduction) {
    return 'Refusing to touch production without --allow-production. Re-run deliberately if you mean it.';
  }
  return null;
}

function readPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // Mute the password while typing: override the output writer.
    rl.stdoutMuted = true;
    const originalWrite = rl._writeToOutput;
    rl._writeToOutput = function mutedWrite(string) {
      if (rl.stdoutMuted) rl.output.write('*');
      else originalWrite.call(rl, string);
    };
    rl.question('Doctor password (min 8 chars, input hidden): ', (answer) => {
      rl.close();
      // eslint-disable-next-line no-console
      console.log('');
      resolve(answer);
    });
  });
}

export async function provisionDoctor(dbPool, { name, email, password, specialty }) {
  const checked = validateProvisionInput({ name, email, password, specialty });
  if (!checked.ok) throw new Error(checked.message);

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = randomUUID();

  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id, role FROM users WHERE email = $1', [
      checked.value.email,
    ]);
    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      throw new Error(
        'An account with that email already exists. Existing accounts are never promoted to doctor.',
      );
    }

    await client.query(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, 'doctor')",
      [userId, checked.value.name, checked.value.email, passwordHash],
    );

    await client.query(
      'INSERT INTO doctor_profiles (user_id, display_name, specialty, is_active) VALUES ($1, $2, $3, TRUE)',
      [userId, checked.value.name, checked.value.specialty],
    );

    await client.query('COMMIT');
    return { id: userId, ...checked.value, role: 'doctor' };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // The connection may already be unusable; the original error wins.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const args = parseProvisionArgs(process.argv.slice(2));
  const guard = provisioningGuard({ nodeEnv: process.env.NODE_ENV, allowProduction: args.allowProduction });
  if (guard) {
    // eslint-disable-next-line no-console
    console.error(guard);
    process.exit(1);
  }

  if (!args.name || !args.email) {
    // eslint-disable-next-line no-console
    console.error('Usage: node scripts/provision-doctor.js --name "Dr. Name" --email doctor@example.com [--specialty X]');
    process.exit(1);
  }

  const password = await readPassword();
  try {
    const created = await provisionDoctor(pool, {
      name: args.name,
      email: args.email,
      password,
      specialty: args.specialty,
    });
    // Only non-secret confirmation details are printed. Never the password.
    // eslint-disable-next-line no-console
    console.log(`Doctor provisioned: ${created.name} <${created.email}> (${created.specialty}). They can now sign in.`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Importable for tests without side effects; only runs as a CLI entrypoint.
const invokedAsCli = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (invokedAsCli) {
  main();
}
