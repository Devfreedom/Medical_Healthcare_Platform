# Medical Healthcare Platform — Northbridge Health

General healthcare platform (local development phase — **no deployment yet**).

## Architecture (planned)

```
Vercel            Render             PostgreSQL
React/Vite  →  Node/Express API  →  database
(medical-website/)   (backend/)
```

- **Frontend:** `medical-website/` — React + Vite. Uses `VITE_API_URL` to talk to
  the API; falls back to a temporary `localStore` when unset (see
  `medical-website/src/lib/api.js`).
- **Backend:** `backend/` — real local Express + PostgreSQL API with JWT auth
  (see `backend/README.md`). Run locally only for now.
- `Backend/` (capital B) is an empty placeholder and is not used.

## Run locally

```bash
# 1. Database + backend (see backend/README.md for full setup)
cd backend
cp .env.example .env   # fill in your own DATABASE_URL + JWT_SECRET
npm install
npm run migrate
npm start              # http://localhost:5000, health: /api/health

# 2. Frontend (new terminal)
cd medical-website
printf 'VITE_API_URL=http://localhost:5000\n' > .env.local   # uncommitted
npm install
npm run dev            # http://localhost:5173
npm run build
npm run lint
```
