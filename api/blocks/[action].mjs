// Consolidated blocks endpoint (one serverless function, routed by the
// [action] dynamic segment, same pattern as api/cohorts/[action].mjs):
//   POST /api/blocks/block   - block another account
//   POST /api/blocks/unblock - remove an existing block
//   GET  /api/blocks/mine    - list ids this account has blocked
//
// Closes issue #145. Blocking is one-directional and unilateral (no
// accept/decline, unlike cohort requests) -- enforcement of "you can't
// message someone who blocked you" lives client-side in the messenger UI
// plus this endpoint's block list; there is no messages table server-side
// today to enforce it against directly (messenger history is
// localStorage-only, same as dispatches/comments).

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

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

async function handleMine(req, res, me) {
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
  block: handleBlock,
  unblock: handleUnblock,
  mine: handleMine
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown blocks action." });
    return;
  }

  const me = await getAuthenticatedAccount(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  return fn(req, res, me);
}
