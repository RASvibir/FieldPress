// Consolidated reports endpoint (one serverless function, routed by the
// [action] dynamic segment, same pattern as api/cohorts/[action].mjs and
// api/admin/[action].mjs to stay under Vercel's per-plan function cap):
//   POST /api/reports/submit  - file a report against a dispatch/comment/user
//   GET  /api/reports/queue   - super_admin only: list open reports
//   POST /api/reports/resolve - super_admin only: mark a report reviewed/dismissed
//
// This is intentionally an intake mechanism, not a full moderation system
// (see Competitive & QA Handout Section 5 "Now" list / issue #171). It
// does not take any automated action against reported content -- it just
// makes reports visible and actionable to admins instead of nonexistent.
// Closes issue #144.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

const VALID_TARGET_TYPES = new Set(["dispatch", "comment", "user"]);
const VALID_RESOLUTIONS = new Set(["reviewed", "dismissed"]);
const MAX_REASON_LEN = 200;
const MAX_DETAILS_LEN = 2000;

function clean(str, max) {
  if (typeof str !== "string") return "";
  const trimmed = str.trim();
  if (!trimmed) return "";
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

async function handleSubmit(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const targetType = typeof body.targetType === "string" ? body.targetType : "";
  const targetId = clean(body.targetId, 128);
  const reason = clean(body.reason, MAX_REASON_LEN);
  const details = clean(body.details, MAX_DETAILS_LEN);

  if (!VALID_TARGET_TYPES.has(targetType)) {
    res.status(400).json({ error: "targetType must be one of: dispatch, comment, user." });
    return;
  }
  if (!targetId) {
    res.status(400).json({ error: "targetId is required." });
    return;
  }
  if (!reason) {
    res.status(400).json({ error: "reason is required." });
    return;
  }

  const [report] = await sql`
    INSERT INTO fieldpress_reports (reporter_id, target_type, target_id, reason, details)
    VALUES (${me.id}, ${targetType}, ${targetId}, ${reason}, ${details})
    RETURNING id, target_type, target_id, reason, status, created_at;
  `;

  res.status(201).json({ report });
}

async function handleQueue(req, res, me) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (me.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden." });
    return;
  }

  const rows = await sql`
    SELECT r.id, r.target_type, r.target_id, r.reason, r.details, r.status,
           r.created_at, r.reviewed_at,
           reporter.id AS reporter_id, reporter.callsign AS reporter_callsign
    FROM fieldpress_reports r
    JOIN fieldpress_accounts reporter ON reporter.id = r.reporter_id
    WHERE r.status = 'open'
    ORDER BY r.created_at ASC
    LIMIT 200;
  `;

  res.status(200).json({ reports: rows });
}

async function handleResolve(req, res, me) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (me.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden." });
    return;
  }

  const body = req.body || {};
  const reportId = typeof body.reportId === "string" ? body.reportId : "";
  const status = typeof body.status === "string" ? body.status : "";

  if (!reportId || !VALID_RESOLUTIONS.has(status)) {
    res.status(400).json({ error: "reportId and a valid status ('reviewed' or 'dismissed') are required." });
    return;
  }

  const [updated] = await sql`
    UPDATE fieldpress_reports
    SET status = ${status}, reviewed_at = now(), reviewed_by = ${me.id}
    WHERE id = ${reportId} AND status = 'open'
    RETURNING id, status, reviewed_at;
  `;

  if (!updated) {
    res.status(404).json({ error: "Report not found or already resolved." });
    return;
  }

  res.status(200).json({ report: updated });
}

const ACTIONS = {
  submit: handleSubmit,
  queue: handleQueue,
  resolve: handleResolve
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown reports action." });
    return;
  }

  const me = await getAuthenticatedAccount(req);
  if (!me) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  return fn(req, res, me);
}
