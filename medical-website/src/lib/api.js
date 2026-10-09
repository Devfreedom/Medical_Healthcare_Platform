// Frontend API abstraction.
// When VITE_API_URL is empty, routes to the temporary localStore backend so the
// UI can be developed without the API running.
// When VITE_API_URL is set, routes to the real HTTP API. Components must use
// `api()` and never touch localStorage directly, so the backend swap requires
// no component changes.
import {
  localAppointments,
  localCreateAppointment,
  localCreateMessage,
  localLogin,
  localLogout,
  localMe,
  localMessages,
  localProfile,
  localRegister,
  localUpdateProfile,
} from './localStore';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// The demo store is a local development convenience. In a production build it
// must never stand in for the real API: patient data belongs in the database,
// and silently falling back would look like a working login while writing
// credentials into localStorage.
const IS_PRODUCTION = Boolean(import.meta.env.PROD);

const NETWORK_ERROR_MESSAGE =
  'Could not reach Northbridge Health. Check your connection and try again.';

const CONFIG_ERROR_MESSAGE =
  'This build is not connected to the Northbridge Health API. Please use the live site.';

export function getToken() {
  return localStorage.getItem('northbridge_token') || localStorage.getItem('northbridge_local_token');
}

export function setSession(token, user) {
  const key = token.startsWith('local-') ? 'northbridge_local_token' : 'northbridge_token';
  localStorage.setItem(key, token);
  localStorage.setItem('northbridge_user', JSON.stringify(user));
}

export function clearSession() {
  localLogout();
  localStorage.removeItem('northbridge_token');
  localStorage.removeItem('northbridge_local_token');
  localStorage.removeItem('northbridge_user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('northbridge_user') || 'null');
  } catch {
    return null;
  }
}

// Keep the cached session identity in step with a profile change so a reload
// shows the same name as the in-memory user.
export function updateStoredUser(patch) {
  const current = getStoredUser();
  if (!current) return null;

  const next = { ...current, ...patch };
  localStorage.setItem('northbridge_user', JSON.stringify(next));
  return next;
}

// Carries the HTTP status so callers can tell "your session expired" (401)
// apart from "the server is down" (network failure or 5xx).
export class ApiError extends Error {
  constructor(message, { status = 0, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (cause) this.cause = cause;
  }
}

function isSessionError(error) {
  return error instanceof ApiError && error.status === 401;
}

async function remoteApi(path, options) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (cause) {
    // Offline, DNS failure, or a blocked request. The stored session may well
    // still be valid, so this must not clear it.
    throw new ApiError(NETWORK_ERROR_MESSAGE, { status: 0, cause });
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof data?.message === 'string' && data.message.trim()
        ? data.message
        : response.status >= 500
          ? 'Northbridge Health is temporarily unavailable. Please try again.'
          : 'Request failed.';

    // Only a 401 is proof that the session is invalid, expired or missing.
    // Server errors and rate limits must leave the user signed in.
    if (response.status === 401) clearSession();

    throw new ApiError(message, { status: response.status });
  }

  return data;
}

export async function api(path, options = {}) {
  if (API_URL) return remoteApi(path, options);

  if (IS_PRODUCTION) {
    throw new ApiError(CONFIG_ERROR_MESSAGE, { status: 0 });
  }

  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/api/auth/register' && options.method === 'POST') return localRegister(body);
  if (path === '/api/auth/login' && options.method === 'POST') return localLogin(body);
  if (path === '/api/auth/me') return localMe();
  if (path === '/api/profile' && !options.method) return localProfile();
  if (path === '/api/profile' && options.method === 'PUT') return localUpdateProfile(body);
  if (path === '/api/appointments' && !options.method) return localAppointments();
  if (path === '/api/appointments' && options.method === 'POST') return localCreateAppointment(body);
  if (path === '/api/messages' && !options.method) return localMessages();
  if (path === '/api/messages' && options.method === 'POST') return localCreateMessage(body);

  throw new ApiError('This feature is not connected yet.', { status: 501 });
}

export { isSessionError };