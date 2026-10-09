// Regression tests for the session-verification policy that App.jsx relies on.
//
// The rule under test: a saved session is erased only when the backend proves
// it is invalid (HTTP 401). Network failures and server errors must leave the
// stored token alone so the user can retry instead of being logged out.
//
// Runs on the Node.js built-in test runner — no test framework is added.
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

const TOKEN = 'valid-jwt-token';
const USER = { id: 'u1', name: 'Test Patient', email: 'patient@example.com' };

let workDir;
let loadCounter = 0;
let api;

before(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'northbridge-session-test-'));
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

const storage = new Map();

beforeEach(() => {
  storage.clear();
  globalThis.localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
});

async function loadApi({ prod = true, apiUrl = 'https://api.example.com' } = {}) {
  globalThis.__VITE_ENV__ = { PROD: prod, VITE_API_URL: apiUrl };
  loadCounter += 1;
  api = await import(`${pathToFileURL(path.join(workDir, 'api.mjs')).href}?v=${loadCounter}`);
  return api;
}

// Reproduces the App.jsx verification effect: call /api/auth/me, classify the
// outcome, clear the stored session only when the classifier says to.
async function verifySession() {
  const mod = await loadApi();

  if (!mod.getToken()) {
    return { ...mod.anonymousSession(), stored: mod.getToken() };
  }

  try {
    const result = await mod.api('/api/auth/me');
    const outcome = mod.classifyVerification({ user: result?.user });

    if (outcome.shouldClear) mod.clearSession();
    else if (outcome.status === mod.SESSION_AUTHENTICATED) {
      const token = mod.getToken();
      if (token) mod.setSession(token, outcome.user);
    }

    return { ...outcome, stored: mod.getToken() };
  } catch (error) {
    const outcome = mod.classifyVerification({ error });
    if (outcome.shouldClear) mod.clearSession();
    return { ...outcome, stored: mod.getToken() };
  }
}

function seedSession() {
  localStorage.setItem('northbridge_token', TOKEN);
  localStorage.setItem('northbridge_user', JSON.stringify(USER));
  localStorage.setItem('northbridge_local_user_id', 'u1');
}

function stubResponse(status, body) {
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  });
}

describe('a reachable API keeps the session and admits the user', () => {
  test('a 200 with a valid user authenticates without clearing storage', async () => {
    seedSession();
    stubResponse(200, { user: USER });

    const result = await verifySession();

    assert.equal(result.status, 'authenticated');
    assert.equal(result.shouldClear, false);
    assert.equal(result.stored, TOKEN, 'the token must survive a successful check');
    assert.equal(result.user.email, USER.email);
    assert.equal(JSON.parse(localStorage.getItem('northbridge_user')).name, USER.name);
  });

  test('a refreshed user from the server replaces the cached copy', async () => {
    seedSession();
    stubResponse(200, { user: { ...USER, name: 'Renamed Patient' } });

    await verifySession();

    assert.equal(JSON.parse(localStorage.getItem('northbridge_user')).name, 'Renamed Patient');
  });
});

describe('HTTP 401 clears the invalid session', () => {
  test('an expired token is discarded and the user returns to anonymous', async () => {
    seedSession();
    stubResponse(401, { message: 'Invalid or expired token.' });

    const result = await verifySession();

    assert.equal(result.status, 'anonymous');
    assert.equal(result.shouldClear, true);
    assert.equal(result.stored, null, 'the token must be gone');
    assert.equal(localStorage.getItem('northbridge_user'), null);
    assert.equal(localStorage.getItem('northbridge_local_user_id'), null);
  });

  test('a 401 whose body carries no message still clears the session', async () => {
    seedSession();
    stubResponse(401, {});

    const result = await verifySession();

    assert.equal(result.status, 'anonymous');
    assert.equal(localStorage.getItem('northbridge_token'), null);
  });

  test('a 200 response with no user is treated as a dead session', async () => {
    seedSession();
    stubResponse(200, {});

    const result = await verifySession();

    assert.equal(result.status, 'anonymous');
    assert.equal(result.shouldClear, true);
    assert.equal(localStorage.getItem('northbridge_token'), null);
  });
});

describe('HTTP 5xx does NOT erase the session', () => {
  for (const status of [500, 502, 503, 504]) {
    test(`HTTP ${status} keeps the token and offers a retry`, async () => {
      seedSession();
      stubResponse(status, { message: 'Something went wrong.' });

      const result = await verifySession();

      assert.equal(result.status, 'unverified', `${status} must be recoverable`);
      assert.equal(result.shouldClear, false, `${status} must not clear the session`);
      assert.equal(result.stored, TOKEN, `${status} must keep the token`);
      assert.equal(localStorage.getItem('northbridge_user'), JSON.stringify(USER));
    });
  }

  test('a 500 with an empty body still produces a retryable state', async () => {
    seedSession();
    stubResponse(500, {});

    const result = await verifySession();

    assert.equal(result.status, 'unverified');
    assert.match(result.error, /temporarily unavailable/i);
    assert.equal(localStorage.getItem('northbridge_token'), TOKEN);
  });

  test('a 500 with a malformed body does not clear the session', async () => {
    seedSession();
    globalThis.fetch = async () => ({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      },
    });

    const result = await verifySession();

    assert.equal(result.status, 'unverified');
    assert.equal(localStorage.getItem('northbridge_token'), TOKEN);
  });
});

describe('other non-401 statuses also keep the session', () => {
  for (const status of [400, 403, 404, 409, 422, 429]) {
    test(`HTTP ${status} is recoverable, not a logout`, async () => {
      seedSession();
      stubResponse(status, { message: 'Request failed.' });

      const result = await verifySession();

      assert.equal(result.status, 'unverified', `${status} must be recoverable`);
      assert.equal(result.stored, TOKEN, `${status} must keep the token`);
    });
  }
});

describe('network failures do NOT erase the session', () => {
  const networkFailures = [
    { label: 'DNS failure', error: () => new TypeError('fetch failed: getaddrinfo ENOTFOUND api.example.com') },
    { label: 'connection refused', error: () => new TypeError('fetch failed') },
    { label: 'offline', error: () => new TypeError('Failed to fetch') },
    { label: 'CORS block', error: () => new TypeError('Failed to fetch') },
    { label: 'request blocked by DevTools', error: () => new TypeError('net::ERR_BLOCKED_BY_CLIENT') },
  ];

  for (const failure of networkFailures) {
    test(`${failure.label} keeps the session and surfaces a retry`, async () => {
      seedSession();
      globalThis.fetch = async () => {
        throw failure.error();
      };

      const result = await verifySession();

      assert.equal(result.status, 'unverified', `${failure.label} must be recoverable`);
      assert.equal(result.shouldClear, false);
      assert.equal(result.stored, TOKEN, `${failure.label} must not clear the session`);
      assert.equal(localStorage.getItem('northbridge_user'), JSON.stringify(USER));
      assert.match(result.error, /could not reach/i);
    });
  }

  test('the failure message never leaks transport internals', async () => {
    seedSession();
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed: getaddrinfo ENOTFOUND api.example.com:443');
    };

    const result = await verifySession();

    assert.doesNotMatch(result.error, /ENOTFOUND|getaddrinfo|api\.example\.com|443/);
    assert.doesNotMatch(result.error, /TypeError|at \w+ \(/);
  });
});

describe('retry after an outage restores the session', () => {
  test('block, then unblock, then retry: storage survives and the user is admitted', async () => {
    seedSession();

    // 1. API unreachable — the recoverable error state.
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    const blocked = await verifySession();
    assert.equal(blocked.status, 'unverified');
    assert.equal(blocked.stored, TOKEN);

    // 2. API back up — the user presses Retry.
    stubResponse(200, { user: USER });
    const retried = await verifySession();

    assert.equal(retried.status, 'authenticated');
    assert.equal(retried.stored, TOKEN);
    assert.equal(retried.user.email, USER.email);
  });

  test('block, then an expired token is discovered: retry clears the session', async () => {
    seedSession();

    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };
    assert.equal((await verifySession()).stored, TOKEN);

    stubResponse(401, { message: 'Invalid or expired token.' });
    const retried = await verifySession();

    assert.equal(retried.status, 'anonymous');
    assert.equal(retried.stored, null, 'a 401 on retry must still clear the session');
  });

  test('repeated outages never progressively destroy the session', async () => {
    seedSession();
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const result = await verifySession();
      assert.equal(result.stored, TOKEN, `attempt ${attempt + 1} must keep the token`);
      assert.equal(localStorage.getItem('northbridge_user'), JSON.stringify(USER));
    }
  });
});

describe('a signed-out user is never asked to verify', () => {
  test('with no stored token the result is anonymous and nothing is requested', async () => {
    let requested = false;
    globalThis.fetch = async () => {
      requested = true;
      throw new Error('fetch must not be called without a token');
    };

    const result = await verifySession();

    assert.equal(result.status, 'anonymous');
    assert.equal(requested, false);
  });
});