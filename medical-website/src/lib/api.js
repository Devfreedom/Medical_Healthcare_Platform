// Frontend API abstraction.
// When VITE_API_URL is empty, routes to the temporary localStore backend.
// When VITE_API_URL is set (future: Render Node/Express + PostgreSQL),
// routes to the real HTTP API. Components must use `api()` and never touch
// localStorage directly, so the backend swap requires no component changes.
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

async function remoteApi(path, options) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new Error(data?.message || 'Request failed.');
  }

  return data;
}

export async function api(path, options = {}) {
  if (API_URL) return remoteApi(path, options);

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

  throw new Error('This feature is not connected yet.');
}
