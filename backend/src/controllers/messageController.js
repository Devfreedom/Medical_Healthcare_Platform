import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { validateMessageBody, validateThreadName } from '../utils/validation.js';

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
    // One query for the user's conversations and one for their messages, so
    // every row returned is already scoped to req.user.id.
    const conversations = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id],
    );

    if (conversations.rowCount === 0) {
      return res.json({ threads: [] });
    }

    const messages = await pool.query(
      `SELECT m.* FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_id = $1
       ORDER BY m.created_at ASC`,
      [req.user.id],
    );

    const threads = conversations.rows.map((conversation) => {
      const mapped = messages.rows
        .filter((row) => row.conversation_id === conversation.id)
        .map((row) => toMessageResponse(conversation.name, row));

      return {
        id: conversation.id,
        name: conversation.name,
        preview: mapped.length > 0 ? mapped[mapped.length - 1].text : '',
        messages: mapped,
      };
    });

    return res.json({ threads });
  } catch (error) {
    return next(error);
  }
}

export async function createMessage(req, res, next) {
  const threadName = validateThreadName(req.body?.threadName);
  if (!threadName.ok) {
    return res.status(422).json({ message: threadName.message });
  }

  const body = validateMessageBody(req.body?.body);
  if (!body.ok) {
    return res.status(422).json({ message: body.message });
  }

  try {
    // Conversations are created server-side (registration) — never by posting
    // an arbitrary name — and must belong to this user before we accept a
    // message. Otherwise any user could write into any other user's thread.
    const conversation = await pool.query(
      'SELECT id, name FROM conversations WHERE user_id = $1 AND name = $2',
      [req.user.id, threadName.value],
    );

    if (conversation.rowCount === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const conversationRow = conversation.rows[0];

    const inserted = await pool.query(
      'INSERT INTO messages (id, conversation_id, sender_type, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [randomUUID(), conversationRow.id, 'me', body.value],
    );

    // No automatic doctor replies — only the user's own message is stored, and
    // nothing is delivered to or read by clinic staff.
    return res.status(201).json({ message: toMessageResponse(conversationRow.name, inserted.rows[0]) });
  } catch (error) {
    return next(error);
  }
}