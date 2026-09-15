// Consolidated messenger endpoint (one serverless function, routed by the
// [action] dynamic segment, same pattern as api/auth/[action].mjs and
// api/cohorts/[action].mjs to stay under Vercel's per-plan function cap):
//   GET  /api/messenger/threads        - list of my threads (last message + unread count)
//   GET  /api/messenger/thread?withId= - full message history with one cohort
//   POST /api/messenger/send           - send a message (cohorts only, not blocked)
//   POST /api/messenger/read           - mark a thread as read
//
// Messaging is cohort-gated: you can only DM someone you have an accepted
// fieldpress_cohort_requests row with. This replaces the old client-only-
// fake messenger where messengerMessages lived purely in React state +
// localStorage with no other real account involved on the other end.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../auth.mjs";

const sql = neon(process.env.DATABASE_URL);

// Messages are stored with participant_a_id < participant_b_id (sorted),
// so every read/write needs the pair normalized the same way regardless
// of who's "me" and who's "them".
function sortedPair(idA, idB) {
  return idA < idB ? [idA, idB] : [idB, idA];
}

async function assertCohorts(meId, otherId) {
  const rows = await sql`
    SELECT id FROM fieldpress_cohort_requests
    WHERE status = 'accepted'
      AND ((requester_id = ${meId} AND recipient_id = ${otherId})
        OR (requester_id = ${otherId} AND recipient_id = ${meId}))
    LIMIT 1;
  `;
  return rows.length > 0;
}

async function assertNotBlocked(meId, otherId) {
  const rows = await sql`
    SELECT id FROM fieldpress_blocks
    WHERE (blocker_id = ${meId} AND blocked_id = ${otherId})
       OR (blocker_id = ${otherId} AND blocked_id = ${meId})
    LIMIT 1;
  `;
  return rows.length === 0;
}

async function handleThreads(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // One row per cohort, with the latest message (if any) and unread count,
  // scoped to cohorts that aren't blocked in either direction so a blocked
  // contact silently drops out of the thread list rather than needing
  // separate client-side filtering.
  const rows = await sql`
    SELECT
      a.id AS other_id, a.callsign AS other_callsign, a.name AS other_name,
      a.bureau AS other_bureau, a.avatar_url AS other_avatar_url,
      lm.body AS last_message_body, lm.sender_id AS last_message_sender_id,
      lm.created_at AS last_message_at,
      COALESCE(unread.count, 0)::int AS unread_count
    FROM fieldpress_cohort_requests cr
    JOIN fieldpress_accounts a
      ON a.id = (CASE WHEN cr.requester_id = ${me.id} THEN cr.recipient_id ELSE cr.requester_id END)
    LEFT JOIN LATERAL (
      SELECT body, sender_id, created_at
      FROM fieldpress_messenger_messages m
      WHERE m.participant_a_id = LEAST(${me.id}, a.id) AND m.participant_b_id = GREATEST(${me.id}, a.id)
      ORDER BY created_at DESC
      LIMIT 1
    ) lm ON true
    LEFT JOIN LATERAL (
      SELECT count(*) AS count
      FROM fieldpress_messenger_messages m
      WHERE m.participant_a_id = LEAST(${me.id}, a.id) AND m.participant_b_id = GREATEST(${me.id}, a.id)
        AND m.sender_id != ${me.id} AND m.read_at IS NULL
    ) unread ON true
    WHERE cr.status = 'accepted'
      AND (cr.requester_id = ${me.id} OR cr.recipient_id = ${me.id})
      AND NOT EXISTS (
        SELECT 1 FROM fieldpress_blocks b
        WHERE (b.blocker_id = ${me.id} AND b.blocked_id = a.id)
           OR (b.blocker_id = a.id AND b.blocked_id = ${me.id})
      )
    ORDER BY lm.created_at DESC NULLS LAST;
  `;

  const threads = rows.map((r) => ({
    user: { id: r.other_id, callsign: r.other_callsign, name: r.other_name, bureau: r.other_bureau, avatarUrl: r.other_avatar_url },
    lastMessage: r.last_message_body
      ? { body: r.last_message_body, senderId: r.last_message_sender_id, createdAt: r.last_message_at }
      : null,
    unreadCount: r.unread_count
  }));

  res.status(200).json({ threads });
}

async function handleThread(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const withId = typeof req.query?.withId === "string" ? req.query.withId : "";
  if (!withId) {
    res.status(400).json({ error: "Missing withId." });
    return;
  }
  if (!(await assertCohorts(me.id, withId))) {
    res.status(403).json({ error: "You can only view threads with a cohort." });
    return;
  }

  const [a, b] = sortedPair(me.id, withId);
  const rows = await sql`
    SELECT id, sender_id, body, read_at, created_at
    FROM fieldpress_messenger_messages
    WHERE participant_a_id = ${a} AND participant_b_id = ${b}
    ORDER BY created_at ASC
    LIMIT 500;
  `;

  res.status(200).json({
    messages: rows.map((m) => ({ id: m.id, senderId: m.sender_id, body: m.body, readAt: m.read_at, createdAt: m.created_at }))
  });
}

async function handleSend(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { recipientId, body } = req.body || {};
  if (typeof recipientId !== "string" || !recipientId) {
    res.status(400).json({ error: "Missing recipientId." });
    return;
  }
  if (recipientId === me.id) {
    res.status(400).json({ error: "You can't message yourself." });
    return;
  }
  const cleanBody = typeof body === "string" ? body.trim().slice(0, 2000) : "";
  if (!cleanBody) {
    res.status(400).json({ error: "Message can't be empty." });
    return;
  }

  if (!(await assertCohorts(me.id, recipientId))) {
    res.status(403).json({ error: "You can only message a cohort. Send a cohort request first." });
    return;
  }
  if (!(await assertNotBlocked(me.id, recipientId))) {
    res.status(403).json({ error: "You can't message this person." });
    return;
  }

  const [a, b] = sortedPair(me.id, recipientId);
  const [row] = await sql`
    INSERT INTO fieldpress_messenger_messages (participant_a_id, participant_b_id, sender_id, body)
    VALUES (${a}, ${b}, ${me.id}, ${cleanBody})
    RETURNING id, sender_id, body, read_at, created_at;
  `;

  res.status(201).json({ message: { id: row.id, senderId: row.sender_id, body: row.body, readAt: row.read_at, createdAt: row.created_at } });
}

async function handleRead(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { withId } = req.body || {};
  if (typeof withId !== "string" || !withId) {
    res.status(400).json({ error: "Missing withId." });
    return;
  }

  const [a, b] = sortedPair(me.id, withId);
  await sql`
    UPDATE fieldpress_messenger_messages
    SET read_at = now()
    WHERE participant_a_id = ${a} AND participant_b_id = ${b}
      AND sender_id != ${me.id} AND read_at IS NULL;
  `;

  res.status(200).json({ ok: true });
}

const ACTIONS = {
  threads: handleThreads,
  thread: handleThread,
  send: handleSend,
  read: handleRead
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown messenger action." });
    return;
  }

  try {
    const me = await getAuthenticatedAccount(req);
    if (!me) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    return await fn(req, res, me);
  } catch (err) {
    console.error("Messenger endpoint error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
