-- Northbridge Health migration 003: real appointment scheduling.
--
-- Additive only: creates doctor_availability_slots, adds nullable
-- appointments.slot_id, and enforces single-active-booking per slot.
-- Existing users and appointments are preserved. Legacy appointments keep
-- slot_id NULL and are never backfilled (provider display names are
-- ambiguous and must not drive ownership).

CREATE TABLE IF NOT EXISTS doctor_availability_slots (
  id UUID PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (ends_at - starts_at = INTERVAL '30 minutes'),
  UNIQUE (doctor_id, starts_at)
);

CREATE INDEX IF NOT EXISTS idx_slots_doctor_start
  ON doctor_availability_slots (doctor_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_slots_active_start
  ON doctor_availability_slots (starts_at) WHERE is_active = TRUE;

-- Nullable slot reference. RESTRICT prevents accidental deletion of a slot
-- that has appointment history attached.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS slot_id UUID NULL
  REFERENCES doctor_availability_slots (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_appointments_slot
  ON appointments (slot_id);

-- One active reservation per slot: pending/confirmed hold it, rejected/
-- cancelled/completed release it. This is the concurrency safeguard —
-- application checks alone cannot prevent double-booking.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_active_slot_booking'
  ) THEN
    CREATE UNIQUE INDEX uq_active_slot_booking
      ON appointments (slot_id)
      WHERE slot_id IS NOT NULL AND status IN ('pending', 'confirmed');
  END IF;
END
$$;
