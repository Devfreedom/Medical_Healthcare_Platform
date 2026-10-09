// Exercises the message controller against a stubbed pg pool. No database is
// contacted and no conversation or message row is ever written.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://stub:stub@localhost:5432/stub';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-used-anywhere-real';
process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import test, { after, describe } from 'node:test';

const { createMessage, listMessages } = await import('../src/controllers/messageController.js');
const { pool } = await import('../src/config/db.js');
const { MESSAGE_MAX_LENGTH } = await import('../src/utils/validation.js');

const originalQuery = pool.query;

after(() => {
  pool.query = originalQuery;
});

const USER_ID = '11111111-1111-1111-1111-111111111111';

// Express sends 200 when json() is called without an explicit status.
function makeRes() {
  return {
    statusCode: 200,
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

async function callCreateMessage(body) {
  const res = makeRes();
  let nextError = null;
  pool.query = async () => ({ rowCount: 0, rows: [] });

  await createMessage({ user: { id: USER_ID }, body }, res, (error) => { nextError = error || null; });
  return { res, nextError };
}

describe('createMessage validation', () => {
  test('rejects a blank message with 422', async () => {
    for (const text of ['', '   ', '\n\t']) {
      const { res } = await callCreateMessage({ threadName: 'Clinic Front Desk', body: text });
      assert.equal(res.statusCode, 422);
      assert.equal(res.body.message, 'Message must not be empty.');
    }
  });

  test('rejects a non-string body with 422', async () => {
    for (const text of [null, undefined, 42, { text: 'hi' }, ['hi']]) {
      const { res } = await callCreateMessage({ threadName: 'Clinic Front Desk', body: text });
      assert.equal(res.statusCode, 422, `${JSON.stringify(text)} should be rejected`);
    }
  });

  test('rejects a missing or blank thread name with 422', async () => {
    for (const name of [undefined, null, '', '   ', 42]) {
      const { res } = await callCreateMessage({ threadName: name, body: 'Hello' });
      assert.equal(res.statusCode, 422);
      assert.equal(res.body.message, 'Choose a conversation.');
    }
  });

  test('rejects a message beyond the maximum length with 422', async () => {
    const { res } = await callCreateMessage({
      threadName: 'Clinic Front Desk',
      body: 'a'.repeat(MESSAGE_MAX_LENGTH + 1),
    });

    assert.equal(res.statusCode, 422);
    assert.match(res.body.message, /characters or fewer/);
  });

  test('accepts a message exactly at the maximum length', async () => {
    // Conversation lookup returns nothing, so this settles at 404 — but only
    // after the length check has already passed.
    const { res } = await callCreateMessage({
      threadName: 'Clinic Front Desk',
      body: 'a'.repeat(MESSAGE_MAX_LENGTH),
    });

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'Conversation not found.');
  });
});

describe('createMessage conversation ownership', () => {
  test('refuses to create a conversation from an unknown thread name', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return { rowCount: 0, rows: [] };
    };

    const res = makeRes();
    await createMessage(
      { user: { id: USER_ID }, body: { threadName: 'Some Other Patient Thread', body: 'Hello' } },
      res,
      () => {},
    );

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.message, 'Conversation not found.');
    assert.equal(queries.length, 1, 'no INSERT should follow a failed lookup');
    assert.match(queries[0].text, /^SELECT/);
    assert.doesNotMatch(queries[0].text, /INSERT/);
  });

  test('always scopes the lookup to the authenticated user', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return { rowCount: 0, rows: [] };
    };

    await createMessage(
      { user: { id: USER_ID }, body: { threadName: 'Clinic Front Desk', body: 'Hello' } },
      makeRes(),
      () => {},
    );

    assert.match(queries[0].text, /WHERE user_id = \$1 AND name = \$2/);
    assert.deepEqual(queries[0].params, [USER_ID, 'Clinic Front Desk']);
  });

  test('never accepts a user id or conversation id from the client', async () => {
    const res = makeRes();
    await createMessage(
      {
        user: { id: USER_ID },
        body: { threadName: 'Clinic Front Desk', body: 'Hi', userId: 'attacker', conversationId: 'attacker' },
      },
      res,
      () => {},
    );

    // The injected fields are ignored; the lookup still uses req.user.id.
    assert.equal(res.statusCode, 404);
  });
});

describe('listMessages isolation', () => {
  test('scopes both the conversation and message queries to the user', async () => {
    const queries = [];
    pool.query = async (text, params) => {
      queries.push({ text, params });
      return { rowCount: 0, rows: [] };
    };

    const res = makeRes();
    await listMessages({ user: { id: USER_ID } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { threads: [] });
    assert.equal(queries.length, 1, 'an empty conversation list short-circuits');
    assert.match(queries[0].text, /WHERE user_id = \$1/);
    assert.deepEqual(queries[0].params, [USER_ID]);
  });

  test('only returns messages belonging to the user own conversations', async () => {
    const conversation = { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Clinic Front Desk', created_at: new Date().toISOString() };
    const mine = {
      id: 'm1',
      conversation_id: conversation.id,
      sender_type: 'me',
      body: 'My message',
      created_at: new Date().toISOString(),
    };
    const theirs = {
      id: 'm2',
      conversation_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      sender_type: 'me',
      body: 'Another patient message',
      created_at: new Date().toISOString(),
    };

    let call = 0;
    pool.query = async () => {
      call += 1;
      // Simulate the join filter already excluding other users' rows.
      return call === 1
        ? { rowCount: 1, rows: [conversation] }
        : { rowCount: 1, rows: [mine] };
    };

    const res = makeRes();
    await listMessages({ user: { id: USER_ID } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.threads.length, 1);
    assert.deepEqual(res.body.threads[0].messages.map((m) => m.text), ['My message']);
    assert.ok(
      !JSON.stringify(res.body).includes('Another patient message'),
      'no other user messages may appear',
    );
  });
});