// Top-level API router — one serverless function for every account-scoped
// resource, routed by the [resource]/[action] dynamic segments so URLs
// are completely unchanged:
//   /api/auth/*          -> _lib/handlers/auth.mjs
//   /api/cohorts/*       -> _lib/handlers/cohorts.mjs (also handles
//                           block/unblock/blockedMine, merged in #197)
//   /api/messenger/*     -> _lib/handlers/messenger.mjs
//   /api/admin/*         -> _lib/handlers/admin.mjs
//   /api/notifications/* -> _lib/handlers/notifications.mjs
//   /api/reports/*       -> _lib/handlers/reports.mjs
//
// These six were previously six separate serverless functions, each
// already internally routed by its own [action] dynamic segment. Adding
// messenger (#196) pushed the total function count to 13, one over
// Vercel's per-plan cap, and #197's blocks/cohorts merge only bought back
// one slot. Rather than keep merging pairs of resources into each other
// as new endpoints get added, this collapses all six into a single
// function and gives real headroom for future resources.
//
// Each handler module below is untouched from its previous file (moved
// to api/_lib/handlers/ — any path segment under api/ prefixed with an
// underscore is excluded from Vercel's function discovery, the same way
// api/_lib/auth.mjs and api/_lib/mailer.mjs already were) and still
// reads req.query.action
// itself; this file only adds the outer req.query.resource dispatch.
// No client-side changes needed: the URL shape /api/{resource}/{action}
// is identical to what each resource's own [action].mjs produced before.

import authHandler from "../_lib/handlers/auth.mjs";
import cohortsHandler from "../_lib/handlers/cohorts.mjs";
import messengerHandler from "../_lib/handlers/messenger.mjs";
import adminHandler from "../_lib/handlers/admin.mjs";
import notificationsHandler from "../_lib/handlers/notifications.mjs";
import reportsHandler from "../_lib/handlers/reports.mjs";

const RESOURCES = {
  auth: authHandler,
  cohorts: cohortsHandler,
  messenger: messengerHandler,
  admin: adminHandler,
  notifications: notificationsHandler,
  reports: reportsHandler
};

export default async function handler(req, res) {
  const resource = req.query?.resource;
  const fn = typeof resource === "string" ? RESOURCES[resource] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown API resource." });
    return;
  }
  return fn(req, res);
}
