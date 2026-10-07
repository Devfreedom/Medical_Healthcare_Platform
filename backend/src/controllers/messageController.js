import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';

function toMessageResponse(conversationName, row) {
  return {
    id: row.id,
    threadName: conversationName,
    from: row.sender_type,
    text: row.body,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listMessages(req, res, next) {
  try {
    const conversations = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id],
    );

    const threads = [];
    for (const conversation of conversations.rows) {
      const messages = await pool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversation.id],
      );
      const mapped = messages.rows.map((row) => toMessageResponse(conversation.name, row));
      threads.push({
        id: conversation.id,
        name: conversation.name,
        preview: mapped.length > 0 ? mapped[mapped.length - 1].text : '',
        messages: mapped,
      });
    }

    return res.json({ threads });
  } catch (error) {
    return next(error);
  }
}

export async function createMessage(req, res, next) {
  try {
    const { threadName, body } = req.body || {};

    if (!threadName || String(threadName).trim().length === 0) {
      return res.status(422).json({ message: 'Choose a conversation.' });
    }
    if (!body || String(body).trim().length === 0) {
      return res.status(422).json({ message: 'Message must not be empty.' });
    }

    const name = String(threadName).trim();
    const text = String(body).trim();

    // Conversations belong to the authenticated user only — never trust a
    // conversation id from the client.
    let conversation = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 AND name = $2',
      [req.user.id, name],
    );

    if (conversation.rowCount === 0) {
      const created = await pool.query(
        'INSERT INTO conversations (id, user_id, name) VALUES ($1, $2, $3) RETURNING *',
        [randomUUID(), req.user.id, name],
      );
      conversation = created;
    }

    const conversationRow = conversation.rows[0];
    const inserted = await pool.query(
      'INSERT INTO messages (id, conversation_id, sender_type, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [randomUUID(), conversationRow.id, 'me', text],
    );

    // No automatic doctor replies — only the user's message is stored.
    return res.status(201).json({ message: toMessageResponse(name, inserted.rows[0]) });
  } catch (error) {
    return next(error);
  }
}
