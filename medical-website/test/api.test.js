// Tests for the frontend API wrapper.
//
// Vite replaces `import.meta.env` at build time, so these tests load the real
// src/lib/api.js with those reads swapped for a runtime stub. The wrapper's own
// logic is exercised unchanged; only the environment lookup is redirected.
//
// Runs on the Node.js built-in test runner — no test framework is added.
//   node --test "medical-website/test/**/*.test.js"
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after, before, beforeEach, describe } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(here, '..', 'src', 'lib');

const apiSource = fs.readFileSync(path.join(libDir, 'api.js'), 'utf8');
const localStoreSource = fs.readFileSync(path.join(libDir, 'localStore.js'), 'utf8');

let workDir;
let loadCounter = 0;

before(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'northbridge-api-test-'));

  fs.writeFileSync(path.join(workDir, 'localStore.mjs'), localStoreSource);

  const patched = apiSource
    .replace(/from '\.\/localStore'/g, "from './localStore.mjs'")
    .replace(/import\.meta\.env\.PROD/g, 'globalThis.__VITE_ENV__.PROD')
    .replace(/import\.meta\.env\.VITE_API_URL/g, 'globalThis.__VITE_ENV__.VITE_API_URL');

  fs.writeFileSync(path.join(workDir, 'api.mjs'), patched);
});

after(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
});

// In-memory localStorage so nothing touches a real browser store.
const storage = new Map();

beforeEach(() => {
  storage.clear();
  globalThis.localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
});

// Each load gets a unique query string so import.meta.env is re-read per case.
function loadApi({ prod, apiUrl }) {
  globalThis.__VITE_ENV__ = { PROD: prod, VITE_API_URL: apiUrl };
  loadCounter += 1;
  return import(`${pathToFileURL(path.join(workDir, 'api.mjs')).href}?v=${loadCounter}`);
}

function seedSession() {
  localStorage.setItem('northbridge_token', 'seeded-real-token');
  localStorage.setItem('northbridge_user', JSON.stringify({ id: '1', name: 'Ada', email: 'ada@example.com' }));
}

function respondWith({ status, body = { message: 'server said no' } }) {
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  });
}

describe('production fails closed without VITE_API_URL', () => {
  test('rejects every guarded endpoint instead of using localStorage', async () => {
    globalThis.fetch = async () => {
      throw new Error('fetch must not be called when the API is unconfigured');
    };

    const { api, ApiError } = await loadApi({ prod: true, apiUrl: '' });

    const calls = [
      ['/api/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Ada', email: 'a@b.co', password: 'password1' }) }],
      ['/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'a@b.co', password: 'password1' }) }],
      ['/api/auth/me', {}],
      ['/api/profile', {}],
      ['/api/profile', { method: 'PUT', body: '{}' }],
      ['/api/appointments', {}],
      ['/api/messages', {}],
      ['/api/messages', { method: 'POST', body: '{}' }],
    ];

    for (const [pathname, options] of calls) {
      await assert.rejects(
        () => api(pathname, options),
        (error) => error instanceof ApiError && /not connected to the Northbridge Health API/.test(error.message),
        `${pathname} should fail closed`,
      );
    }
  });

  test('writes no credentials, tokens or demo data to localStorage', async () => {
    globalThis.fetch = async () => {
      throw new Error('fetch must not be called when the API is unconfigured');
    };

    const { api } = await loadApi({ prod: true, apiUrl: '' });

    await assert.rejects(() => api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password1' }),
    }));

    assert.equal(storage.size, 0, `expected no localStorage writes, found: ${[...storage.keys()]}`);
  });
});

describe('local development keeps the demo store working', () => {
  test('registers locally when VITE_API_URL is unset outside production', async () => {
    const { api } = await loadApi({ prod: false, apiUrl: '' });

    const result = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password1' }),
    });

    assert.ok(result.token.startsWith('local-'));
    assert.equal(result.user.email, 'ada@example.com');
    assert.ok(storage.has('northbridge_local_users'));
  });

  test('serves the rest of the local flow without an API', async () => {
    const { api } = await loadApi({ prod: false, apiUrl: '' });

    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'password1' }),
    });

    assert.ok((await api('/api/auth/me')).user.email);
    assert.ok((await api('/api/profile')).profile);
    assert.ok(Array.isArray((await api('/api/messages')).threads));
  });
});

describe('session clearing is limited to HTTP 401', () => {
  const cases = [
    { status: 401, clears: true },
    { status: 403, clears: false },
    { status: 422, clears: false },
    { status: 429, clears: false },
    { status: 500, clears: false },
    { status: 503, clears: false },
  ];

  for (const { status, clears } of cases) {
    test(`HTTP ${status} ${clears ? 'clears' : 'keeps'} the session`, async () => {
      seedSession();
      respondWith({ status });

      const { api, isSessionError } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });

      await assert.rejects(() => api('/api/profile'), (error) => {
        assert.equal(error.status, status, 'the HTTP status must be preserved');
        assert.equal(isSessionError(error), clears);
        return true;
      });

      assert.equal(localStorage.getItem('northbridge_token'), clears ? null : 'seeded-real-token');
      assert.equal(
        localStorage.getItem('northbridge_user'),
        clears ? null : JSON.stringify({ id: '1', name: 'Ada', email: 'ada@example.com' }),
      );
    });
  }
});

describe('network failures', () => {
  test('produce an understandable message without leaking internals', async () => {
    seedSession();
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed: getaddrinfo ENOTFOUND api.invalid');
    };

    const { api } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });

    await assert.rejects(() => api('/api/auth/me'), (error) => {
      assert.match(error.message, /could not reach/i);
      assert.doesNotMatch(error.message, /ENOTFOUND|getaddrinfo|fetch failed|api\.invalid/);
      assert.doesNotMatch(error.message, /at \w+ \(/); // no stack frames
      return true;
    });
  });

  test('do not erase the stored session', async () => {
    seedSession();
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed');
    };

    const { api, isSessionError } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });

    await assert.rejects(() => api('/api/auth/me'));
    assert.equal(localStorage.getItem('northbridge_token'), 'seeded-real-token');
    assert.equal(isSessionError({ status: 0 }), false);
  });
});

describe('error messages never contain secrets', () => {
  test('a 5xx with no body message falls back to safe copy', async () => {
    respondWith({ status: 500, body: {} });

    const { api } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });

    await assert.rejects(() => api('/api/profile'), (error) => {
      assert.match(error.message, /temporarily unavailable/i);
      assert.doesNotMatch(error.message, /bearer|secret|token|password/i);
      return true;
    });
  });

  test('a malformed JSON body does not throw while parsing', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      },
    });

    const { api } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });

    await assert.rejects(() => api('/api/profile'), (error) => {
      assert.match(error.message, /temporarily unavailable/i);
      return true;
    });
  });
});

describe('updateStoredUser', () => {
  test('merges a name change into the cached session', async () => {
    const { updateStoredUser } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });
    seedSession();

    const next = updateStoredUser({ name: 'Ada Lovelace' });

    assert.equal(next.name, 'Ada Lovelace');
    assert.equal(next.email, 'ada@example.com');
    assert.equal(JSON.parse(localStorage.getItem('northbridge_user')).name, 'Ada Lovelace');
  });

  test('returns null when there is no cached session', async () => {
    const { updateStoredUser } = await loadApi({ prod: true, apiUrl: 'https://api.example.com' });
    assert.equal(updateStoredUser({ name: 'Nobody' }), null);
  });
});