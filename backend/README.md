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
| POST   | `/api/appointments`   | yes  | `{reason, provider, visitType, date}` (future date; time `"To be confirmed"`, status `pending`) → 201 `{appointment}` |
| GET    | `/api/messages`       | yes  | own threads `{threads}`              |
| POST   | `/api/messages`       | yes  | `{threadName, body}` (non-empty) → 201 `{message}`; no fake replies |

## 6. Frontend connection

The React app (`medical-website/`) uses `VITE_API_URL` to switch from the
temporary `localStore` fallback to this API. For local development create an
**uncommitted** `medical-website/.env.local`:

```
VITE_API_URL=http://localhost:5000
```

Then run the frontend (`npm run dev` in `medical-website/`). No component
changes are needed — all calls stay behind `src/lib/api.js`.

## 7. Security notes

- bcryptjs-hashed passwords (cost 12), never returned in responses.
- JWT (`sub` = user id) verified per request; every protected query filters by `req.user.id`.
- Parameterized SQL only; helmet headers; rate-limited `/api/auth`; strict CORS (no wildcard); centralized error handler (no stack traces in production).
- Frontend temporary auth remains only as the `VITE_API_URL`-unset fallback.
