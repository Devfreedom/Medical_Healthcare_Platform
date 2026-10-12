# Northbridge Health API

Real local backend for the Northbridge Health project: Node.js + Express + PostgreSQL.
Local development only — **no deployment yet**.

## Prerequisites

- Node.js 18+
- PostgreSQL 16+ (a server you can create databases on)

## 1. PostgreSQL setup

Create a dedicated database (use your own credentials — never commit them):

```sql
CREATE DATABASE northbridge_health;
```

If you cannot create roles on a shared cluster, you can run your own
user-owned instance, e.g.:

```bash
/usr/lib/postgresql/16/bin/initdb -D ~/.northbridge-pg/data -U $(whoami) --auth=trust
/usr/lib/postgresql/16/bin/pg_ctl -D ~/.northbridge-pg/data -o "-p 5433 -k /tmp" -l ~/.northbridge-pg/logfile start
psql -h localhost -p 5433 -d postgres -c "CREATE DATABASE northbridge_health;"
```

## 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

| Variable       | Example                                              |
| -------------- | ---------------------------------------------------- |
| `PORT`         | `5000`                                               |
| `DATABASE_URL` | `postgresql://USER@localhost:5433/northbridge_health` |
| `JWT_SECRET`   | long random hex (generate, never hard-code)          |
| `JWT_EXPIRES_IN` | `7d`                                               |
| `CLIENT_ORIGIN`| `http://localhost:5173` (comma-separated allowed)   |

Never commit `.env`. `JWT_SECRET` and `DATABASE_URL` must come from the environment.

## 3. Install + migrate + start

```bash
npm install
npm run migrate   # creates tables from src/db/migrations (reproducible, tracked)
npm start         # or: npm run dev (watch mode)
```

## 4. Health check

```bash
curl http://localhost:5000/api/health
# {"status":"ok","db":"ok"}
```

## 5. API summary

All protected routes require `Authorization: Bearer <JWT>`.
Errors are `{ "message": "..." }` with status 401 / 403 / 404 / 409 / 422 / 500.

| Method | Path                  | Auth | Description                          |
| ------ | --------------------- | ---- | ------------------------------------ |
| GET    | `/api/health`         | no   | liveness + DB check                  |
| POST   | `/api/auth/register`  | no   | `{name, email, password}` → 201 `{token, user}` (+ profile, conversation, welcome message, transactionally) |
| POST   | `/api/auth/login`     | no   | `{email, password}` → `{token, user}` |
| GET    | `/api/auth/me`        | yes  | current user `{user}`                |
| GET    | `/api/profile`        | yes  | `{profile}`                          |
| PUT    | `/api/profile`        | yes  | update name/DOB/phone/notifications; email read-only → `{profile}` |
| GET    | `/api/appointments`   | yes  | own appointments `{appointments}`    |
| POST   | `/api/appointments`   | yes  | `{reason, visitType, date}` + either `doctorId` (verified active doctor; display name/specialty taken from the record) or legacy `provider` text → 201 `{appointment}` (status `pending`, `doctor_id` NULL for legacy) |
| GET    | `/api/doctors`        | yes  | active doctor directory `{doctors: [{id, displayName, specialty}]}` |
| GET    | `/api/doctor/appointments` | doctor | appointments assigned to the signed-in doctor only |
| PATCH  | `/api/doctor/appointments/:id` | doctor | `{status: 'confirmed' \| 'rejected'}` for own pending requests (404 for other doctors' rows, 409 once decided) |
| GET    | `/api/messages`       | yes  | own threads `{threads}`              |
| POST   | `/api/messages`       | yes  | `{threadName, body}` (non-empty, ≤2000 chars) → 201 `{message}`; the conversation must already belong to you (404 otherwise); no fake replies |

`PUT /api/profile` accepts `name` (2–100 chars after trimming), `dateOfBirth` (real
calendar date, not in the future; `""` clears), `phone` (≤32 chars, international
formatting allowed; `""` clears) and `notifications` with boolean values only.
Invalid input returns 422, and the `users` + `patient_profiles` rows are written
in one transaction.

## 6. Doctor accounts (operator provisioning only)

There is no public doctor registration. Public `POST /api/auth/register`
always creates `role: 'patient'` (any `role` in the body is ignored). A
trusted operator provisions each doctor with the one-time CLI (run from
`backend/`, with the backend `.env` present, against the intended database):

```bash
npm run migrate   # apply 002_doctor_role.sql first
node scripts/provision-doctor.js --name "Dr. Jane Doe" --email jane@example.com --specialty Cardiology
# password is prompted on stdin (hidden); it is never logged or stored
```

The script hashes with bcrypt (cost 12), creates `users(role='doctor')` +
`doctor_profiles` in one transaction, rejects duplicate emails, and refuses
to promote existing accounts. It refuses to run with `NODE_ENV=test` and
refuses production without an explicit `--allow-production` flag. Doctors
sign in via the normal login page and land on `/doctor`.

## 7. Frontend connection

The React app (`medical-website/`) uses `VITE_API_URL` to switch from the
temporary `localStore` fallback to this API. For local development create an
**uncommitted** `medical-website/.env.local`:

```
VITE_API_URL=http://localhost:5000
```

Then run the frontend (`npm run dev` in `medical-website/`). No component
changes are needed — all calls stay behind `src/lib/api.js`.

## 8. Security notes

- bcryptjs-hashed passwords (cost 12), never returned in responses.
- JWT (`sub` = user id) verified per request; role is re-read from `users` on every request (never trusted from JWT claims or client state). Doctor routes additionally require `requireRole('doctor')`: 401 without a session, 403 for patients. Every protected query filters by `req.user.id` (patients) or `doctor_id = req.user.id` (doctors).
- Parameterized SQL only; helmet headers; strict CORS (no wildcard); centralized error handler (no stack traces in production).
- Rate limits (15-minute window unless noted): 20 for `/api/auth/login`, 10 per hour for `/api/auth/register`, and a shared 100 for `/api/auth`.
- Token verification failures return 401; database failures are passed to the centralized handler and return 500 rather than being reported as bad credentials.
- Messages are stored only. They are not delivered to or monitored by clinic staff, and no clinician replies are generated.
- Frontend temporary auth remains only as the `VITE_API_URL`-unset fallback, and is disabled outright in production builds (`import.meta.env.PROD`).

## 9. Tests

No test framework is required — the Node.js built-in runner is used:

```bash
npm test     # backend validation, profile, auth, message + doctor-role tests (80)
```

The auth and message controller tests stub `pool.query`, so no database is
contacted and no real data is read or written.

```bash
cd ../medical-website && npm test   # frontend api.js wrapper tests (43)
```
