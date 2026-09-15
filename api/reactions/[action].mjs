// Consolidated reactions endpoint (one serverless function, routed by the
// [action] dynamic segment, same pattern as api/cohorts/[action].mjs and
// api/reports/[action].mjs to stay under Vercel's per-plan function cap):
//   POST /api/reactions/dispute       - toggle the caller's dispute flag on a dispatch
//   GET  /api/reactions/dispute-count - dispute counts for one or more dispatch ids
//
// Scope is intentionally narrow: only the "Disputed" reaction is
// server-backed. Every other reaction (frontpage, signal, investigate,
// solidarity, broadcast) stays client-side/localStorage -- they're social
// signals with no downstream workflow. "Disputed" is a trust & safety
// flag (#146, #175), so it needs to be a real per-account toggle that's
// consistent across devices and visible to the moderation queue, not a
// per-browser count. See migrations/0008_dispute_reactions_schema.sql.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

async function handleToggle(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const dispatchId = typeof req.body?.dispatchId === "string" ? req.body.dispatchId.trim() : "";
  if (!dispatchId) {
    res.status(400).json({ error: "dispatchId is required." });
    return;
  }

  const existing = await sql`
    SELECT id FROM fieldpress_dispute_reactions
    WHERE dispatch_id = ${dispatchId} AND account_id = ${me.id}
    LIMIT 1;
  `;

  let disputed;
  if (existing.length > 0) {
    await sql`DELETE FROM fieldpress_dispute_reactions WHERE id = ${existing[0].id};`;
    disputed = false;
  } else {
    await sql`
      INSERT INTO fieldpress_dispute_reactions (dispatch_id, account_id)
      VALUES (${dispatchId}, ${me.id})
      ON CONFLICT (dispatch_id, account_id) DO NOTHING;
    `;
    disputed = true;
  }

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM fieldpress_dispute_reactions WHERE dispatch_id = ${dispatchId};
  `;

  res.status(200).json({ dispatchId, disputed, count });
}

async function handleCounts(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const raw = typeof req.query?.ids === "string" ? req.query.ids : "";
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 200);
  if (ids.length === 0) {
    res.status(200).json({ counts: {}, mine: {} });
    return;
  }

  const rows = await sql`
    SELECT dispatch_id, COUNT(*)::int AS count
    FROM fieldpress_dispute_reactions
    WHERE dispatch_id = ANY(${ids})
    GROUP BY dispatch_id;
  `;
  const mineRows = await sql`
    SELECT dispatch_id
    FROM fieldpress_dispute_reactions
    WHERE dispatch_id = ANY(${ids}) AND account_id = ${me.id};
  `;

  const counts = {};
  rows.forEach((r) => { counts[r.dispatch_id] = r.count; });
  const mine = {};
  mineRows.forEach((r) => { mine[r.dispatch_id] = true; });

  res.status(200).json({ counts, mine });
}

const ACTIONS = {
  dispute: handleToggle,
  "dispute-count": handleCounts
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown reactions action." });
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
    console.error("Reactions endpoint error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
