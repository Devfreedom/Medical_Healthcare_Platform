// Exercises requireAuth against a stubbed pg pool. No database connection is
// opened and no production data is read or written: `pool.query` is replaced
// with a per-test stub before any request runs.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://stub:stub@localhost:5432/stub';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-used-anywhere-real';
process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import test, { after, describe } from 'node:test';
import jwt from 'jsonwebtoken';

const { requireAuth } = await import('../src/middleware/auth.js');
const { pool } = await import('../src/config/db.js');
const { env } = await import('../src/config/env.js');

const originalQuery = pool.query;

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// Runs requireAuth with a stubbed pool.query and reports how it responded.
async function run({ token, header, query }) {
  const res = makeRes();
  let nextCalled = false;
  let nextError = null;

  pool.query = query;

  const authorization = header !== undefined
    ? header
    : token
      ? `Bearer ${token}`
      : undefined;

  const req = { headers: authorization ? { authorization } : {} };
  await requireAuth(req, res, (error) => {
    nextCalled = true;
    nextError = error || null;
  });

  return { res, nextCalled, nextError, req };
}

function userRow() {
  return { id: '11111111-1111-1111-1111-111111111111', name: 'Ada', email: 'ada@example.com' };
}

describe('requireAuth', () => {
  test('rejects a missing Authorization header with 401', async () => {
    const { res, nextCalled } = await run({
      token: null,
      query: () => { throw new Error('pool.query must not be called'); },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  test('rejects a missing or non-Bearer Authorization scheme with 401', async () => {
    for (const header of ['abc', 'Basic abc123', 'Bearer', 'Bearer   ']) {
      const { res, nextCalled } = await run({
        header,
        query: () => { throw new Error('pool.query must not be called'); },
      });

      assert.equal(res.statusCode, 401, `${header} should be rejected`);
      assert.equal(res.body.message, 'Authentication required.');
      assert.equal(nextCalled, false);
    }
  });

  test('returns 401 for an invalid signature', async () => {
    const forged = jwt.sign({ sub: 'anyone' }, 'a-different-secret');

    const { res, nextCalled } = await run({
      token: forged,
      query: () => { throw new Error('pool.query must not be called'); },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired token.');
    assert.equal(nextCalled, false);
  });

  test('returns 401 for a structurally invalid token', async () => {
    const { res } = await run({
      token: 'not-a-jwt',
      query: () => { throw new Error('pool.query must not be called'); },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired token.');
  });

  test('returns 401 for an expired token', async () => {
    const expired = jwt.sign({ sub: userRow().id }, env.jwtSecret, { expiresIn: '-1s' });

    const { res } = await run({
      token: expired,
      query: () => { throw new Error('pool.query must not be called'); },
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Invalid or expired token.');
  });

  test('returns 401 when the user record no longer exists', async () => {
    const token = jwt.sign({ sub: '22222222-2222-2222-2222-222222222222' }, env.jwtSecret);

    const { res, nextCalled } = await run({
      token,
      query: async () => ({ rowCount: 0, rows: [] }),
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Account not found.');
    assert.equal(nextCalled, false);
  });

  test('passes a database failure to the error handler instead of calling it 401', async () => {
    const token = jwt.sign({ sub: userRow().id }, env.jwtSecret);
    const dbError = new Error('connect ECONNREFUSED 127.0.0.1:5432');

    const { res, nextCalled, nextError } = await run({
      token,
      query: async () => { throw dbError; },
    });

    assert.equal(nextCalled, true, 'DB failures must reach the centralized error handler');
    assert.equal(nextError, dbError);
    assert.equal(res.statusCode, null, 'a DB failure must not be answered as a 401');
  });

  test('attaches the user and continues when the lookup succeeds', async () => {
    const row = userRow();
    const token = jwt.sign({ sub: row.id }, env.jwtSecret);

    const { res, nextCalled, nextError, req } = await run({
      token,
      query: async (text, params) => {
        assert.match(text, /FROM users WHERE id = \$1/);
        assert.deepEqual(params, [row.id]);
        return { rowCount: 1, rows: [row] };
      },
    });

    assert.equal(nextCalled, true);
    assert.equal(nextError, null);
    assert.deepEqual(req.user, row);
    assert.equal(res.statusCode, null);
  });

  test('never leaks SQL or token details in the 401 body', async () => {
    const forged = jwt.sign({ sub: 'anyone' }, 'a-different-secret');
    const { res } = await run({
      token: forged,
      query: () => { throw new Error('unused'); },
    });

    const serialized = JSON.stringify(res.body);
    assert.doesNotMatch(serialized, /SELECT|FROM users/i);
    assert.doesNotMatch(serialized, new RegExp(forged.slice(0, 12)));
  });
});

// Restore the real pool so nothing else in the process uses a stub.
after(() => {
  pool.query = originalQuery;
});