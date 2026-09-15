// Consolidated notifications endpoint (one serverless function, routed by
// the [action] dynamic segment, same pattern as api/auth/[action].mjs and
// api/cohorts/[action].mjs to stay under Vercel's per-plan function cap):
//   GET  /api/notifications/mine        - list the caller's notifications (paginated, most recent first)
//   POST /api/notifications/mark-read   - mark one or all notifications as read
//
// v1 scope is cohort_request and cohort_accepted only - see migration
// 0007_notifications_schema.sql for why comments aren't included yet.
// Rows are written from api/cohorts/[action].mjs at the point a request
// is sent or accepted, not derived/polled here.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../auth.mjs";

const sql = neon(process.env.DATABASE_URL);

function toClientShape(row) {
  return {
    id: row.id,
    type: row.type,
    actor: {
      id: row.actor_id,
      callsign: row.actor_callsign,
      name: row.actor_name,
      avatarUrl: row.actor_avatar_url
    },
    cohortRequestId: row.cohort_request_id || undefined,
    read: row.read_at != null,
    createdAt: row.created_at
  };
}

async function handleMine(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rows = await sql`
    SELECT n.id, n.type, n.cohort_request_id, n.read_at, n.created_at,
           a.id AS actor_id, a.callsign AS actor_callsign, a.name AS actor_name, a.avatar_url AS actor_avatar_url
    FROM fieldpress_notifications n
    JOIN fieldpress_accounts a ON a.id = n.actor_id
    WHERE n.recipient_id = ${me.id}
    ORDER BY n.created_at DESC
    LIMIT 50;
  `;

  const unreadCount = rows.filter((r) => r.read_at == null).length;

  res.status(200).json({ notifications: rows.map(toClientShape), unreadCount });
}

async function handleMarkRead(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { id } = req.body || {};

  if (typeof id === "string" && id) {
    await sql`
      UPDATE fieldpress_notifications
      SET read_at = now()
      WHERE id = ${id} AND recipient_id = ${me.id} AND read_at IS NULL;
    `;
  } else {
    // No id provided - mark everything as read (the bell's "open panel"
    // action).
    await sql`
      UPDATE fieldpress_notifications
      SET read_at = now()
      WHERE recipient_id = ${me.id} AND read_at IS NULL;
    `;
  }

  res.status(200).json({ ok: true });
}

const ACTIONS = {
  mine: handleMine,
  "mark-read": handleMarkRead
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown notifications action." });
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
    console.error("Notifications endpoint error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
