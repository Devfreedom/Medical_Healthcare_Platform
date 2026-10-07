-- Northbridge Health initial schema.
-- Users own everything via user_id; no user_id is ever trusted from the client.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS patient_profiles (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  date_of_birth DATE NULL,
  phone TEXT NULL,
  appointment_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  test_result_notices BOOLEAN NOT NULL DEFAULT TRUE,
  billing_updates BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'Primary Care',
  reason TEXT NOT NULL,
  visit_type TEXT NOT NULL CHECK (visit_type IN ('video', 'in-person')),
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT 'To be confirmed',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments (user_id, date);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('me', 'them')),
  body TEXT NOT NULL CHECK (char_length(body) >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at);
