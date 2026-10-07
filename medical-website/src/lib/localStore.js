// TEMPORARY FRONTEND-ONLY AUTH STORE — NOT SECURE, NOT PRODUCTION.
// Uses localStorage + a non-cryptographic demo hash so the UI can be
// exercised before the real backend exists. Passwords here are NOT securely
// stored. The future Node/Express + PostgreSQL API will replace this entire
// module with real authentication and persistent server data.
const USERS_KEY = 'northbridge_local_users';
const DATA_KEY = 'northbridge_local_data';
const SESSION_KEY = 'northbridge_local_user_id';

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function hashPassword(value) {
  // DEMO ONLY — FNV-1a is not password hashing. Never use in production.
  // Kept isolated here so the Express backend can replace it with bcrypt/argon2.
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function getUsers() {
  return read(USERS_KEY, []);
}

function saveUsers(users) {
  write(USERS_KEY, users);
}

function getAllData() {
  return read(DATA_KEY, {});
}

function saveAllData(data) {
  write(DATA_KEY, data);
}

function getCurrentUserId() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) throw new Error('Authentication required.');
  return id;
}

export function localRegister({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with that email already exists.');
  }

  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = { id, name: name.trim(), email: normalizedEmail };

  saveUsers([
    ...users,
    {
      ...user,
      passwordHash: hashPassword(password),
    },
  ]);

  const data = getAllData();
  data[id] = {
    profile: {
      id,
      name: user.name,
      email: user.email,
      dateOfBirth: '',
      phone: '',
      notifications: {
        appointments: true,
        results: true,
        billing: false,
      },
    },
    appointments: [],
    messages: [
      {
        id: `message-${Date.now()}`,
        threadName: 'Clinic Front Desk',
        from: 'them',
        text: 'Welcome to Northbridge Health. Your account is ready.',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  saveAllData(data);
  localStorage.setItem(SESSION_KEY, id);

  return {
    token: `local-${id}`,
    user,
  };
}

export function localLogin({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers().find((candidate) => candidate.email === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error('Email or password is incorrect.');
  }

  localStorage.setItem(SESSION_KEY, user.id);

  return {
    token: `local-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export function localMe() {
  const id = getCurrentUserId();
  const user = getUsers().find((candidate) => candidate.id === id);

  if (!user) throw new Error('Account not found.');

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export function localLogout() {
  localStorage.removeItem(SESSION_KEY);
}

export function localProfile() {
  const id = getCurrentUserId();
  const data = getAllData();

  if (!data[id]?.profile) throw new Error('Profile not found.');

  return { profile: data[id].profile };
}

export function localUpdateProfile(payload) {
  const id = getCurrentUserId();
  const data = getAllData();

  if (!data[id]) throw new Error('Account data not found.');

  data[id].profile = {
    ...data[id].profile,
    ...payload,
    name: payload.name?.trim() || data[id].profile.name,
  };

  const users = getUsers().map((user) =>
    user.id === id ? { ...user, name: data[id].profile.name } : user,
  );

  saveUsers(users);
  saveAllData(data);

  // Keep the cached session identity in sync so header/portal show the new name.
  try {
    const stored = JSON.parse(localStorage.getItem('northbridge_user') || 'null');
    if (stored && stored.id === id) {
      localStorage.setItem(
        'northbridge_user',
        JSON.stringify({ id, name: data[id].profile.name, email: data[id].profile.email }),
      );
    }
  } catch {
    // Ignore corrupt session cache — App revalidates via localMe().
  }

  return { profile: data[id].profile };
}

export function localAppointments() {
  const id = getCurrentUserId();
  const data = getAllData();

  return { appointments: data[id]?.appointments || [] };
}

export function localCreateAppointment(payload) {
  const id = getCurrentUserId();
  const data = getAllData();

  if (!data[id]) throw new Error('Account data not found.');

  const appointment = {
    id: `appointment-${Date.now()}`,
    provider: payload.provider,
    specialty: payload.specialty || 'Primary Care',
    reason: payload.reason,
    visitType: payload.visitType,
    date: payload.date,
    time: 'To be confirmed',
    status: 'pending',
  };

  data[id].appointments = [...(data[id].appointments || []), appointment];
  saveAllData(data);

  return { appointment };
}

export function localMessages() {
  const id = getCurrentUserId();
  const data = getAllData();
  const messages = data[id]?.messages || [];
  const threads = [];

  messages.forEach((message) => {
    const existing = threads.find((thread) => thread.name === message.threadName);

    if (existing) {
      existing.messages.push(message);
      return;
    }

    threads.push({
      id: message.threadName,
      name: message.threadName,
      preview: message.text,
      messages: [message],
    });
  });

  return { threads };
}

export function localCreateMessage({ threadName, body }) {
  const id = getCurrentUserId();
  const data = getAllData();

  if (!data[id]) throw new Error('Account data not found.');

  const message = {
    id: `message-${Date.now()}`,
    threadName,
    from: 'me',
    text: body.trim(),
    createdAt: new Date().toISOString(),
  };

  data[id].messages = [...(data[id].messages || []), message];
  saveAllData(data);

  return { message };
}
