-- Northbridge Health migration 002: explicit role model + doctor records.
--
-- Non-destructive: only ADDs columns/tables/constraints. Existing rows are
-- preserved; every pre-existing user keeps authenticating as a patient.
--
-- 1. users.role ('patient' default; 'doctor' provisioned via CLI only).
--    Public registration MUST always insert 'patient' (see authController).
-- 2. doctor_profiles, one row per doctor user (provisioned transactionally).
-- 3. appointments.doctor_id, NULLABLE so legacy rows stay intact and
--    unassigned. Never backfilled from provider TEXT: display names are
--    ambiguous and guessing ownership would misassign patient requests.
-- 4. Appointment status gains 'rejected' for the doctor confirm/reject flow.
--    The old CHECK constraint is dropped by name (auto-named
--    appointments_status_check by Postgres) and re-added with the wider set.

-- 1. Role on users.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'patient'
  CHECK (role IN ('patient', 'doctor'));

-- 2. Doctor profiles (one per doctor user).
CREATE TABLE IF NOT EXISTS doctor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) >= 2),
  specialty TEXT NOT NULL DEFAULT 'Primary Care',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_active
  ON doctor_profiles (is_active);

-- 3. Nullable assignment on appointments. Legacy rows keep doctor_id NULL.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS doctor_id UUID NULL REFERENCES users (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_appointments_doctor
  ON appointments (doctor_id);

-- 4. Widen the status set with 'rejected'. Safe: existing values
--    (pending/confirmed/completed/cancelled) all remain valid.
--    Wrapped in a DO block so the migration stays re-runnable: ADD CONSTRAINT
--    has no IF NOT EXISTS variant in Postgres, and migrate.js skips applied
--    files, but a half-applied retry must not fail on the constraint.
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointments_status_with_rejected'
  ) THEN
    ALTER TABLE appointments
      ADD CONSTRAINT appointments_status_with_rejected
      CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected'));
  END IF;
END
$$;
