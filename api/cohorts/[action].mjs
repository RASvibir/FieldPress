// Consolidated cohorts + blocks endpoint (one serverless function, routed
// by the [action] dynamic segment, same pattern as api/auth/[action].mjs
// to stay under Vercel's per-plan function cap):
//   GET  /api/cohorts/directory   - browse/search real accounts
//   POST /api/cohorts/request     - send a cohort request
//   POST /api/cohorts/respond     - accept/decline an incoming request
//   GET  /api/cohorts/mine        - my cohorts + incoming + outgoing requests
//   POST /api/cohorts/block       - block another account
//   POST /api/cohorts/unblock     - remove an existing block
//   GET  /api/cohorts/blockedMine - list ids this account has blocked
//
// A "cohort" is not a separate row/table - it's simply an accepted
// fieldpress_cohort_requests row (from either direction). This replaces
// the old client-only-fake cohort system that let a user "establish a
// cohort desk" out of typed-in text with no other real account involved.
//
// Blocking (closes #145) was originally its own api/blocks/[action].mjs
// function; folded in here to stay under Vercel's per-plan serverless
// function cap once api/messenger/[action].mjs pushed the count over the
// limit. Blocking is one-directional and unilateral (no accept/decline,
// unlike cohort requests) and shares this file's auth pattern, DB client,
// and "relationship between two accounts" domain, so the merge is a
// natural fit rather than a forced one. Its "mine" action is renamed to
// "blockedMine" here to avoid colliding with this file's own /mine.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

function toPublicUser(row) {
  return {
    id: row.id,
    callsign: row.callsign,
    name: row.name,
    bureau: row.bureau,
    avatarUrl: row.avatar_url
  };
}

async function handleDirectory(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const query = typeof req.query?.query === "string" ? req.query.query.trim().slice(0, 100) : "";

  const rows = query
    ? await sql`
        SELECT id, callsign, name, bureau, avatar_url
        FROM fieldpress_accounts
        WHERE id != ${me.id}
          AND (callsign ILIKE ${"%" + query + "%"} OR name ILIKE ${"%" + query + "%"})
        ORDER BY name ASC
        LIMIT 50;
      `
    : await sql`
        SELECT id, callsign, name, bureau, avatar_url
        FROM fieldpress_accounts
        WHERE id != ${me.id}
        ORDER BY name ASC
        LIMIT 50;
      `;

  const relations = await sql`
    SELECT id, requester_id, recipient_id, status
    FROM fieldpress_cohort_requests
    WHERE (requester_id = ${me.id} OR recipient_id = ${me.id})
      AND status != 'declined';
  `;

  const relationByAccountId = new Map();
  for (const r of relations) {
    const otherId = r.requester_id === me.id ? r.recipient_id : r.requester_id;
    if (r.status === "accepted") {
      relationByAccountId.set(otherId, { status: "cohort", requestId: r.id });
    } else if (r.status === "pending") {
      relationByAccountId.set(otherId, {
        status: r.requester_id === me.id ? "pending_sent" : "pending_received",
        requestId: r.id
      });
    }
  }

  const users = rows.map((row) => ({
    ...toPublicUser(row),
    relation: relationByAccountId.get(row.id)?.status || "none",
    requestId: relationByAccountId.get(row.id)?.requestId || null
  }));

  res.status(200).json({ users });
}

async function handleRequest(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { recipientId, message } = req.body || {};
  if (typeof recipientId !== "string" || !recipientId) {
    res.status(400).json({ error: "Missing recipientId." });
    return;
  }
  if (recipientId === me.id) {
    res.status(400).json({ error: "You can't send a cohort request to yourself." });
    return;
  }

  const recipientRows = await sql`SELECT id FROM fieldpress_accounts WHERE id = ${recipientId} LIMIT 1;`;
  if (recipientRows.length === 0) {
    res.status(404).json({ error: "That account no longer exists." });
    return;
  }

  const existing = await sql`
    SELECT id, status FROM fieldpress_cohort_requests
    WHERE (requester_id = ${me.id} AND recipient_id = ${recipientId})
       OR (requester_id = ${recipientId} AND recipient_id = ${me.id})
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  if (existing.length > 0 && existing[0].status !== "declined") {
    res.status(409).json({ error: "A request or cohort connection already exists with this person." });
    return;
  }

  const cleanMessage = typeof message === "string" ? message.trim().slice(0, 500) : "";

  const [row] = await sql`
    INSERT INTO fieldpress_cohort_requests (requester_id, recipient_id, message)
    VALUES (${me.id}, ${recipientId}, ${cleanMessage})
    RETURNING id, requester_id, recipient_id, message, status, created_at;
  `;

  // Notify the recipient (#168) - failure here shouldn't fail the request
  // itself, so it's a best-effort side effect, not part of the main flow.
  try {
    await sql`
      INSERT INTO fieldpress_notifications (recipient_id, actor_id, type, cohort_request_id)
      VALUES (${recipientId}, ${me.id}, 'cohort_request', ${row.id});
    `;
  } catch (notifErr) {
    console.error("Failed to write cohort_request notification:", notifErr);
  }

  res.status(201).json({ request: row });
}

async function handleRespond(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { requestId, action } = req.body || {};
  if (typeof requestId !== "string" || (action !== "accept" && action !== "decline")) {
    res.status(400).json({ error: "Missing or invalid requestId/action." });
    return;
  }

  const rows = await sql`
    SELECT id, requester_id, recipient_id, status FROM fieldpress_cohort_requests
    WHERE id = ${requestId}
    LIMIT 1;
  `;
  if (rows.length === 0) {
    res.status(404).json({ error: "Request not found." });
    return;
  }
  const reqRow = rows[0];
  if (reqRow.recipient_id !== me.id) {
    res.status(403).json({ error: "Only the recipient can respond to this request." });
    return;
  }
  if (reqRow.status !== "pending") {
    res.status(409).json({ error: "This request has already been responded to." });
    return;
  }

  const newStatus = action === "accept" ? "accepted" : "declined";
  const [updated] = await sql`
    UPDATE fieldpress_cohort_requests
    SET status = ${newStatus}, responded_at = now()
    WHERE id = ${requestId}
    RETURNING id, requester_id, recipient_id, status;
  `;

  // Notify the original requester that their request was accepted (#168).
  // No notification on decline - a decline isn't something the current
  // notification center is meant to surface.
  if (newStatus === "accepted") {
    try {
      await sql`
        INSERT INTO fieldpress_notifications (recipient_id, actor_id, type, cohort_request_id)
        VALUES (${reqRow.requester_id}, ${me.id}, 'cohort_accepted', ${reqRow.id});
      `;
    } catch (notifErr) {
      console.error("Failed to write cohort_accepted notification:", notifErr);
    }
  }

  res.status(200).json({ request: updated });
}

async function handleMine(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rows = await sql`
    SELECT r.id, r.requester_id, r.recipient_id, r.message, r.status, r.created_at,
           a.id AS other_id, a.callsign AS other_callsign, a.name AS other_name,
           a.bureau AS other_bureau, a.avatar_url AS other_avatar_url
    FROM fieldpress_cohort_requests r
    JOIN fieldpress_accounts a
      ON a.id = (CASE WHEN r.requester_id = ${me.id} THEN r.recipient_id ELSE r.requester_id END)
    WHERE (r.requester_id = ${me.id} OR r.recipient_id = ${me.id})
      AND r.status != 'declined'
    ORDER BY r.created_at DESC;
  `;

  const cohorts = [];
  const incoming = [];
  const outgoing = [];

  for (const row of rows) {
    const other = {
      id: row.other_id,
      callsign: row.other_callsign,
      name: row.other_name,
      bureau: row.other_bureau,
      avatarUrl: row.other_avatar_url
    };
    if (row.status === "accepted") {
      cohorts.push({ requestId: row.id, user: other });
    } else if (row.recipient_id === me.id) {
      incoming.push({ requestId: row.id, message: row.message, createdAt: row.created_at, user: other });
    } else {
      outgoing.push({ requestId: row.id, message: row.message, createdAt: row.created_at, user: other });
    }
  }

  res.status(200).json({ cohorts, incoming, outgoing });
}

async function handleBlock(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const blockedId = typeof req.body?.blockedId === "string" ? req.body.blockedId : "";
  if (!blockedId) {
    res.status(400).json({ error: "blockedId is required." });
    return;
  }
  if (blockedId === me.id) {
    res.status(400).json({ error: "You can't block yourself." });
    return;
  }

  const [target] = await sql`SELECT id FROM fieldpress_accounts WHERE id = ${blockedId} LIMIT 1;`;
  if (!target) {
    res.status(404).json({ error: "That account doesn't exist." });
    return;
  }

  await sql`
    INSERT INTO fieldpress_blocks (blocker_id, blocked_id)
    VALUES (${me.id}, ${blockedId})
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
  `;

  res.status(200).json({ blocked: true });
}

async function handleUnblock(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const blockedId = typeof req.body?.blockedId === "string" ? req.body.blockedId : "";
  if (!blockedId) {
    res.status(400).json({ error: "blockedId is required." });
    return;
  }

  await sql`
    DELETE FROM fieldpress_blocks
    WHERE blocker_id = ${me.id} AND blocked_id = ${blockedId};
  `;

  res.status(200).json({ blocked: false });
}

async function handleBlockedMine(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rows = await sql`
    SELECT blocked_id FROM fieldpress_blocks WHERE blocker_id = ${me.id};
  `;

  res.status(200).json({ blockedIds: rows.map((r) => r.blocked_id) });
}

const ACTIONS = {
  directory: handleDirectory,
  request: handleRequest,
  respond: handleRespond,
  mine: handleMine,
  block: handleBlock,
  unblock: handleUnblock,
  blockedMine: handleBlockedMine
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown cohorts/blocks action." });
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
    console.error("Cohorts endpoint error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
